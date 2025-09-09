package models

import (
	"time"

	"maitysaranya.com/EvaluatorService/Internal/models/lang"
)

type ProblemSubmission struct {
	SubmissionID string        `json:"submissionId"`
	ProblemID    string        `json:"problemId"`
	Code         string        `json:"code"`
	Language     lang.Language `json:"lang"`
}

type ProblemConstraint struct {
	TimeLimit   time.Duration
	MemoryLimit uint64 // in bytes
}

type ExecutionResult struct {
	Output        string
	Error         string
	ExitCode      int64
	ExecutionTime time.Duration
	MemoryUsage   uint64
}
