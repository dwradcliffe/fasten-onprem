package models

import (
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
)

type User struct {
	ModelBase
	FullName string       `json:"full_name"`
	Username string       `json:"username" gorm:"unique"`
	Password string       `json:"password"`
	Picture  string       `json:"picture"`
	Email    string       `json:"email"`
	Role     pkg.UserRole `json:"role"`
}

// FrontendUser is User with the addition of Permissions arranged
// as we want for sending to and from the frontend
type FrontendUser struct {
	User
	Permissions map[string]map[string]bool `json:"permissions"`
}

func (user *User) HashPassword(password string) error {
	if len(strings.TrimSpace(password)) == 0 {
		return fmt.Errorf("password cannot be empty")
	}
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return err
	}
	user.Password = string(bytes)
	return nil
}
func (user *User) CheckPassword(providedPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(providedPassword))
	if err != nil {
		return err
	}
	return nil
}
