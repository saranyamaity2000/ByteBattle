package lang

import (
	"encoding/json"
	"fmt"
)

// Language represents a supported programming language
type Language string

// Supported languages as constants (enum-like behavior)
const (
	Python3    Language = "python3"
	CPlusPlus  Language = "c++"
	Java       Language = "java"       // not yet supported
	JavaScript Language = "javascript" // not yet supported
)

var SupportedCodingLanguages = []Language{Python3, CPlusPlus}

// IsValid checks if the language is supported
func (l Language) IsValid() bool {
	switch l {
	case Python3, CPlusPlus:
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
