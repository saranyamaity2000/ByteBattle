package client

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"maitysaranya.com/EvaluatorService/Internal/models"
)

type IProblemClient interface {
	GetTestcases(slug string) ([]models.ProblemTestCase, error)
}

type problemClientImp struct {
	baseUrl string
}

// GetTestCases retrieves test cases for a given problem slug
func (p *problemClientImp) GetTestcases(slug string) ([]models.ProblemTestCase, error) {
	relativePath := fmt.Sprintf("testcases/download/%s", slug)
	fullApiPath := p.baseUrl + "/" + relativePath

	log.Println("Fetching test cases for problem slug: " + slug)
	resp, err := http.Get(fullApiPath)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if !strings.HasPrefix(resp.Header.Get("Content-Type"), "application/json") {
		return nil, fmt.Errorf("Expected application/json response, got %s", resp.Header.Get("Content-Type"))
	}

	var testCases []models.ProblemTestCase
	if err := json.NewDecoder(resp.Body).Decode(&testCases); err != nil {
		return nil, err
	}
	log.Println("Test cases fetched successfully")
	return testCases, nil
}

// Create a new ProblemClient instance
func NewProblemClient(baseUrl string) IProblemClient {
	return &problemClientImp{
		baseUrl: baseUrl,
	}
}
