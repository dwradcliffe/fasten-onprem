package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/google/uuid"
)

func escapeJSONString(s string) string {
	var result strings.Builder
	for _, r := range s {
		switch r {
		case '"', '\\', '/':
			result.WriteRune('\\')
			result.WriteRune(r)
		case '\b':
			result.WriteString("\\b")
		case '\f':
			result.WriteString("\\f")
		case '\n':
			result.WriteString("\\n")
		case '\r':
			result.WriteString("\\r")
		case '\t':
			result.WriteString("\\t")
		default:
			if r < 32 || r > 126 {
				result.WriteString(fmt.Sprintf("\\u%04x", r))
			} else {
				result.WriteRune(r)
			}
		}
	}
	return result.String()
}

func loadJSONSafely(filePath string) (map[string]interface{}, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	re := regexp.MustCompile(`"text"\s*:\s*"((?:\\.|[^"\\])*)"`)
	contentStr := re.ReplaceAllStringFunc(string(content), func(match string) string {
		rtf := re.FindStringSubmatch(match)[1]
		escapedRTF := escapeJSONString(rtf)
		return fmt.Sprintf(`"text": "%s"`, escapedRTF)
	})

	var resource map[string]interface{}
	err = json.Unmarshal([]byte(contentStr), &resource)
	return resource, err
}

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Please provide both input folder path and output file path as command line arguments.")
		os.Exit(1)
	}

	folderPath := os.Args[1]
	outputFile := os.Args[2]

	var resources []map[string]interface{}

	files, err := filepath.Glob(filepath.Join(folderPath, "*.json"))
	if err != nil {
		fmt.Printf("Error reading folder: %v\n", err)
		os.Exit(1)
	}

	for _, filename := range files {
		fmt.Printf("Loading %s\n", filename)
		resource, err := loadJSONSafely(filename)
		if err != nil {
			fmt.Printf("Error loading %s: %v\n", filename, err)
			fmt.Println("Skipping this file and continuing...")
			continue
		}
		resources = append(resources, resource)
	}

	hasPatient := false
	var subjectName string
	var subjectID string

	for _, resource := range resources {
		resourceType, ok := resource["resourceType"].(string)
		if ok && resourceType == "Patient" {
			hasPatient = true
			break
		}

		// Look for subject in other resources
		if subject, ok := resource["subject"].(map[string]interface{}); ok {
			if reference, ok := subject["reference"].(string); ok {
				parts := strings.Split(reference, "/")
				if len(parts) == 2 && parts[0] == "Patient" {
					subjectID = parts[1]
				}
			}
			if display, ok := subject["display"].(string); ok {
				subjectName = display
			}
		}
	}

	if !hasPatient {
		patientID := subjectID
		if patientID == "" {
			patientID = uuid.New().String()
		}

		patient := map[string]interface{}{
			"resourceType": "Patient",
			"id":           patientID,
			"name": []map[string]interface{}{
				{
					"use":    "official",
					"family": "Generated",
					"given":  []string{"Patient"},
				},
			},
		}

		if subjectName != "" {
			nameParts := strings.Split(subjectName, " ")
			name := map[string]interface{}{
				"use": "official",
			}
			if len(nameParts) > 1 {
				name["family"] = nameParts[len(nameParts)-1]
				name["given"] = []string{strings.Join(nameParts[:len(nameParts)-1], " ")}
			} else {
				name["family"] = subjectName
			}
			patient["name"] = []map[string]interface{}{name}
		}

		resources = append(resources, patient)
	}

	bundle := map[string]interface{}{
		"resourceType": "Bundle",
		"type":         "collection",
		"entry":        make([]map[string]interface{}, 0),
	}

	for _, resource := range resources {
		bundle["entry"] = append(bundle["entry"].([]map[string]interface{}), map[string]interface{}{"resource": resource})
	}

	bundleJSON, err := json.MarshalIndent(bundle, "", "  ")
	if err != nil {
		fmt.Printf("Error creating JSON: %v\n", err)
		os.Exit(1)
	}

	err = os.WriteFile(outputFile, bundleJSON, 0644)
	if err != nil {
		fmt.Printf("Error writing to file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Bundle saved to %s\n", outputFile)
}
