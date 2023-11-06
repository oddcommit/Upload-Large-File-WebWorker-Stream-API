package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
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

		file, err := os.OpenFile(fileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Println(err)
			return
		}
		defer file.Close()

		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Println(err)
			return
		}

		_, err = file.Write(body)
		if err != nil {
			log.Println(err)
			return
		}

		fmt.Fprint(w, "successfully file uploaded!")
	}
}

func main() {
	http.HandleFunc("/upload", handleUpload)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
