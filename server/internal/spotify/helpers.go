package spotify

import (
	"log/slog"
	"strings"
)

func getID(itemURI string) string {
	parts := strings.Split(itemURI, ":")
	if len(parts) < 3 {

		slog.Warn("unexpected spotify URI format", "uri", itemURI)
		return itemURI
	}
	return parts[2]

}
