package client

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-resty/resty/v2" // using resty for http client :) trying something new
	"maitysaranya.com/EvaluatorService/Internal/config"
	"maitysaranya.com/EvaluatorService/Internal/models"
	"maitysaranya.com/EvaluatorService/Internal/utility"
)

type ISubmissionClient interface {
	MarkTimeLimitExceeded(submissionId string) error
	MarkMemoryLimitExceeded(submissionId string) error
	MarkCompilationError(submissionId, err string) error
	MarkRuntimeError(submissionId, err string) error
	MarkAccepted(submissionId string) error
	MarkWrongAnswer(submissionId, customVerdict, error string) error
	MarkFailed(submissionId, err string) error
	MarkInProgress(submissionId string) error
}

type submissionClientImp struct {
	baseUrl string
}

func (p *submissionClientImp) updateSubmissionStatus(submissionId string, statusUpdateDTO models.SubmissionStatusUpdateDTO) error {
	if submissionId == "" {
		return fmt.Errorf("submissionId is required")
	}

	relativePath := fmt.Sprintf("submissions/%v", submissionId)
	fullApiPath := p.baseUrl + "/" + relativePath
	client := resty.New()
	resp, err := client.R().SetHeader("X-Api-Key", config.AppConfig.XApiKey).SetBody(statusUpdateDTO).Patch(fullApiPath)
	if err != nil {
		return err
	}
	var responseBody map[string]interface{}
	json.Unmarshal(resp.Body(), &responseBody)
	if resp.StatusCode() != http.StatusOK {
		return fmt.Errorf("failed to update submission status: %v", responseBody)
	}
	return nil
}

func (p *submissionClientImp) MarkTimeLimitExceeded(submissionId string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusCompleted),
		Result: &models.SubmissionResult{
			Verdict: string(models.VerdictTimeLimitExceeded),
		},
	})
}

func (p *submissionClientImp) MarkMemoryLimitExceeded(submissionId string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusCompleted),
		Result: &models.SubmissionResult{
			Verdict: string(models.VerdictMemoryLimitExceeded),
		},
	})
}

func (p *submissionClientImp) MarkCompilationError(submissionId string, err string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusCompleted),
		Result: &models.SubmissionResult{
			Verdict: string(models.VerdictCompilationError),
			Error:   err,
		},
	})
}

func (p *submissionClientImp) MarkRuntimeError(submissionId string, err string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusCompleted),
		Result: &models.SubmissionResult{
			Verdict: string(models.VerdictRuntimeError),
			Error:   err,
		},
	})
}

func (p *submissionClientImp) MarkAccepted(submissionId string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusCompleted),
		Result: &models.SubmissionResult{
			Verdict: string(models.VerdictAccepted),
		},
	})
}

func (p *submissionClientImp) MarkWrongAnswer(submissionId string, customVerdict string, error string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusCompleted),
		Result: &models.SubmissionResult{
			Verdict: utility.If(customVerdict != "", customVerdict, string(models.VerdictWrongAnswer)),
			Error:   error,
		},
	})
}

func (p *submissionClientImp) MarkFailed(submissionId, err string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusFailed),
		Result: &models.SubmissionResult{
			Error: err,
		},
	})
}

func (p *submissionClientImp) MarkInProgress(submissionId string) error {
	return p.updateSubmissionStatus(submissionId, models.SubmissionStatusUpdateDTO{
		Status: string(models.StatusRunning),
	})
}

func NewSubmissionClient(baseUrl string) ISubmissionClient {
	return &submissionClientImp{
		baseUrl: baseUrl,
	}
}
