package main

import (
	"log"
	"net/http"
)

func main() {
	log.Println("starting server on port 8080...")
	http.Handle("/", http.FileServer(http.Dir("../ui/src")))

	log.Fatal(http.ListenAndServe(":8080", nil))
}
