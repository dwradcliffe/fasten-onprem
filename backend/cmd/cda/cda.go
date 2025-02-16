package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ClinicalDocument struct {
	XMLName    xml.Name    `xml:"ClinicalDocument"`
	Patient    Patient     `xml:"recordTarget>patientRole>patient"`
	Components []Component `xml:"component>section"`
}

type Patient struct {
	Name   string `xml:"name"`
	Gender struct {
		Code        string `xml:"code,attr"`
		DisplayName string `xml:"displayName,attr"`
	} `xml:"administrativeGenderCode"`
	DOB struct {
		Value string `xml:"value,attr"`
	} `xml:"birthTime"`
}

type Component struct {
	Title string `xml:"title"`
	Code  struct {
		DisplayName string `xml:"displayName,attr"`
	} `xml:"code"`
	Entries []Entry `xml:"entry"`
}

type Entry struct {
	Organizer Organizer `xml:"organizer"`
}

type Organizer struct {
	Code struct {
		DisplayName string `xml:"displayName,attr"`
	} `xml:"code"`
	Components []OrganizerComponent `xml:"component"`
}

type OrganizerComponent struct {
	Observation Observation `xml:"observation"`
}

type Observation struct {
	Code struct {
		System      string `xml:"codeSystem,attr"`
		Code        string `xml:"code,attr"`
		DisplayName string `xml:"displayName,attr"`
	} `xml:"code"`
	Text          ObservationText `xml:"text"`
	EffectiveTime struct {
		Low struct {
			Value string `xml:"value,attr"`
		} `xml:"low"`
		High struct {
			Value string `xml:"value,attr"`
		} `xml:"high"`
	} `xml:"effectiveTime"`
}

type ObservationText struct {
	Value string `xml:"value"`
	Unit  string `xml:"unit"`
}

type FHIRBundle struct {
	ResourceType string         `json:"resourceType"`
	Type         string         `json:"type"`
	Entry        []FHIRResource `json:"entry"`
}

type FHIRResource struct {
	FullURL    string      `json:"fullUrl"`
	Resource   interface{} `json:"resource"`
	ResourceID string      `json:"-"`
}

type FHIRPatient struct {
	ResourceType string     `json:"resourceType"`
	ID           string     `json:"id"`
	Name         []FHIRName `json:"name"`
	Gender       string     `json:"gender"`
	BirthDate    string     `json:"birthDate"`
}

type FHIRName struct {
	Use    string   `json:"use"`
	Family string   `json:"family"`
	Given  []string `json:"given"`
}

type FHIRObservation struct {
	ResourceType      string                `json:"resourceType"`
	ID                string                `json:"id"`
	Status            string                `json:"status"`
	Category          []FHIRCodeableConcept `json:"category"`
	Code              FHIRCodeableConcept   `json:"code"`
	Subject           FHIRReference         `json:"subject"`
	ValueQuantity     FHIRQuantity          `json:"valueQuantity"`
	EffectiveDateTime string                `json:"effectiveDateTime"`
	Issued            string                `json:"issued"`
}

type FHIRCodeableConcept struct {
	Coding []FHIRCoding `json:"coding"`
	Text   string       `json:"text,omitempty"`
}

type FHIRCoding struct {
	System  string `json:"system"`
	Code    string `json:"code"`
	Display string `json:"display"`
}

type FHIRReference struct {
	Reference string `json:"reference"`
}

type FHIRQuantity struct {
	Value  float64 `json:"value"`
	Unit   string  `json:"unit"`
	System string  `json:"system"`
	Code   string  `json:"code"`
}

func main() {
	// Check if a file path is provided
	if len(os.Args) < 3 {
		fmt.Println("Please provide both input file path and output file path as command line arguments.")
		os.Exit(1)
	}

	inputFile := os.Args[1]
	outputFile := os.Args[2]

	// Read the file
	xmlData, err := os.ReadFile(inputFile)
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		os.Exit(1)
	}

	// Parse XML
	var doc ClinicalDocument
	err = xml.Unmarshal(xmlData, &doc)
	if err != nil {
		fmt.Printf("Error parsing XML: %v\n", err)
		os.Exit(1)
	}

	// Create FHIR Bundle
	bundle := FHIRBundle{
		ResourceType: "Bundle",
		Type:         "collection",
		Entry:        []FHIRResource{},
	}

	// Create FHIR Patient
	patientID := uuid.New().String()
	patient := FHIRPatient{
		ResourceType: "Patient",
		ID:           patientID,
		Name: []FHIRName{
			{
				Use:    "official",
				Family: doc.Patient.Name,
				Given:  []string{},
			},
		},
		Gender:    translateGender(doc.Patient.Gender.Code),
		BirthDate: formatBirthDate(doc.Patient.DOB.Value),
	}

	patientUrl := fmt.Sprintf("urn:uuid:%s", patientID)

	bundle.Entry = append(bundle.Entry, FHIRResource{
		FullURL:    patientUrl,
		Resource:   patient,
		ResourceID: patientID,
	})

	// Create FHIR Observations
	observationCount := 0
	for _, component := range doc.Components {
		for _, entry := range component.Entries {
			// Get the category from the organizer
			category := entry.Organizer.Code.DisplayName

			for _, orgComponent := range entry.Organizer.Components {
				// if observationCount >= 10 {
				// 	break
				// }
				obs := orgComponent.Observation
				observationID := uuid.New().String()

				value, _ := strconv.ParseFloat(obs.Text.Value, 64)

				// Override unit for Body Mass Index
				unit := obs.Text.Unit
				if obs.Code.Code == "39156-5" && obs.Code.DisplayName == "Body mass index" {
					unit = "kg/m2"
				}

				observation := FHIRObservation{
					ResourceType: "Observation",
					ID:           observationID,
					Status:       "final",
					Category: []FHIRCodeableConcept{
						{
							Coding: []FHIRCoding{
								{
									// TODO: Find a way to translate this properly
									System:  "http://terminology.hl7.org/CodeSystem/observation-category",
									Code:    strings.ToLower(category),
									Display: category,
								},
							},
						},
					},
					Code: FHIRCodeableConcept{
						Coding: []FHIRCoding{
							{
								System:  getCodeSystem(obs.Code.System),
								Code:    obs.Code.Code,
								Display: obs.Code.DisplayName,
							},
						},
						Text: obs.Code.DisplayName,
					},
					Subject: FHIRReference{
						Reference: patientUrl,
					},
					ValueQuantity: FHIRQuantity{
						Value:  value,
						Unit:   unit,
						System: "http://unitsofmeasure.org",
						Code:   unit,
					},
					EffectiveDateTime: formatEffectiveDateTime(obs.EffectiveTime.Low.Value),
					Issued:            formatEffectiveDateTime(obs.EffectiveTime.High.Value),
					// TODO: Check what to do with the 2 dates
				}

				bundle.Entry = append(bundle.Entry, FHIRResource{
					FullURL:    fmt.Sprintf("urn:uuid:%s", observationID),
					Resource:   observation,
					ResourceID: observationID,
				})

				observationCount++
			}
			// if observationCount >= 10 {
			// 	break
			// }
		}
		// if observationCount >= 10 {
		// 	break
		// }
	}

	// Output FHIR JSON
	outputJSON, err := json.MarshalIndent(bundle, "", "  ")
	if err != nil {
		fmt.Printf("Error creating JSON: %v\n", err)
		os.Exit(1)
	}

	err = os.WriteFile(outputFile, outputJSON, 0644)
	if err != nil {
		fmt.Printf("Error writing JSON to file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("FHIR JSON output with %d observations written to %s\n", observationCount, outputFile)
}

func translateGender(code string) string {
	switch code {
	case "M":
		return "male"
	case "F":
		return "female"
	default:
		return "unknown"
	}
}

func formatBirthDate(date string) string {
	if len(date) == 8 {
		return fmt.Sprintf("%s-%s-%s", date[:4], date[4:6], date[6:])
	}
	return date
}

func getCodeSystem(codeSystem string) string {
	switch codeSystem {
	case "2.16.840.1.113883.6.1":
		return "http://loinc.org"
	// Add more mappings as needed
	default:
		return codeSystem
	}
}

func formatEffectiveDateTime(dateTime string) string {
	formats := []string{
		"20060102150405-0700",
		"20060102150405",      // YYYYMMDDhhmmss
		"2006-01-02T15:04:05", // ISO8601 without timezone
		"2006-01-02 15:04:05", // Common datetime format
		time.DateOnly,         // Date only
		time.RFC3339,          // ISO8601 with timezone
	}

	var t time.Time
	var err error

	for _, format := range formats {
		t, err = time.Parse(format, dateTime)
		if err == nil {
			break
		}
	}

	if err != nil {
		return dateTime // Return original string if parsing fails
	}

	// Format the time according to the desired output
	return t.Format(time.RFC3339)
}
