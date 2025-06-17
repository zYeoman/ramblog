package main

import (
	"embed"
)

//go:embed all:out
var StaticFiles embed.FS
