package main

import (
	"bytes"
	"compress/gzip"
	"flag"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

var (
	buf0 = make([]byte, 1048576)
	buf1 = bytes.Repeat([]byte{0xFF}, 1048576)
)

var listen = flag.String("listen", "127.0.0.1:3333", "listen host:port")

func handler(w http.ResponseWriter, req *http.Request) {
	var cnt0, cnt1 int
	var name string
	if _, e := fmt.Sscanf(req.URL.Path, "/%x/%x/%s", &cnt0, &cnt1, &name); e != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if req.Method == http.MethodHead {
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Length", fmt.Sprint((cnt0+cnt1)/8))
		w.WriteHeader(http.StatusOK)
		return
	}
	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !strings.Contains(req.Header.Get("Accept-Encoding"), "gzip") {
		w.WriteHeader(http.StatusNotAcceptable)
		w.Write([]byte("Please download with 'curl --compressed' or in a browser.\n"))
		return
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Content-Disposition", "attachment")

	bytes0, bytes1 := cnt0/8, cnt1/8
	middle0, middle1 := cnt0%8, cnt1%8
	pages0, pages1 := bytes0/len(buf0), bytes1/len(buf1)
	bytes0 -= pages0 * len(buf0)
	bytes1 -= pages1 * len(buf1)

	z, _ := gzip.NewWriterLevel(w, 1)
	defer z.Close()

	writePages := func(page []byte, count int) error {
		ctx := req.Context()
		for i := 0; i < count; i++ {
			z.Write(page)
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(time.Millisecond):
			}
		}
		return nil
	}

	if e := writePages(buf0, pages0); e != nil {
		return
	}
	z.Write(buf0[:bytes0])
	if middle0+middle1 > 0 {
		z.Write([]byte{0xFF >> middle0})
	}
	z.Write(buf1[:bytes1])
	writePages(buf1, pages1)
}

func main() {
	flag.Parse()
	log.Fatal(http.ListenAndServe(*listen, http.HandlerFunc(handler)))
}
