package lang

import (
	"encoding/json"
	"fmt"
)

// Language represents a supported programming language
type Language string

// Supported languages as constants (enum-like behavior)
const (
	Python    Language = "python"
	CPlusPlus Language = "c++"
)

// IsValid checks if the language is supported
func (l Language) IsValid() bool {
	switch l {
	case Python, CPlusPlus:
		return true
	default:
		return false
	}
}

// String returns the string representation of the language
func (l Language) String() string {
	return string(l)
}

// UnmarshalJSON implements json.Unmarshaler for Language
func (l *Language) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	lang := Language(s)
	if !lang.IsValid() {
		return fmt.Errorf("unsupported language: %s", s)
	}
	*l = lang
	return nil
}
func (l Language) MarshalJSON() ([]byte, error) {
	return json.Marshal(string(l))
}
