package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
)

var uploadPath = os.TempDir()

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func WriteFileFunc(file *os.File, body []byte, done chan bool) {
	_, err := file.Write(body)
	if err != nil {
		log.Println(err)
	}
	done <- true
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.URL.Path == "/upload" && r.Method == "POST" {
		query, err := url.ParseQuery(r.URL.RawQuery)
		if err != nil {
			log.Println(err)
			return
		}
		fileName := query.Get("fileName")
		fileIndex := query.Get("fileIndex")
		uploadFolder := "./uploads"
		filePath := uploadFolder + "/" + fileName
		file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Println(err)
			return
		}

		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Println(err)
			file.Close()
			return
		}

		done := make(chan bool)
		go WriteFileFunc(file, body, done)

		<-done
		file.Close()
		fmt.Fprint(w, fileIndex)
	}
}

func main() {
	uploadFolder := "./uploads"

	// Serve the "uploads" folder as a public directory
	fs := http.FileServer(http.Dir(uploadFolder))
	http.Handle("/uploads/", http.StripPrefix("/uploads/", fs))
	http.HandleFunc("/upload", handleUpload)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
