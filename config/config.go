package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/invopop/yaml"
	"github.com/spf13/viper"
)

var (
	debounceDelay = 2 * time.Second // Time to wait before triggering a reload
	lastModTime   time.Time         // Last modification time of the config file
)

type ConfigStruct struct {
	Untis struct {
		TodayURL    string
		TomorrowURL string
	}
	Advertisement struct {
		Path                     string
		SwitchingTime            uint
		RefetchTime              uint
		ReloadIframeOnSizeChange bool
		FixedHight               bool
	}
	ScrollText struct {
		Path        string
		Texts       []string
		RefetchTime uint
	}
	WebServer struct {
		ServerAddress string
	}
}

var Config ConfigStruct = ConfigStruct{
	Untis: struct {
		TodayURL    string
		TomorrowURL string
	}{
		TodayURL:    "https://example.com/today",
		TomorrowURL: "https://example.com/tomorrow",
	},
	Advertisement: struct {
		Path                     string
		SwitchingTime            uint
		RefetchTime              uint
		ReloadIframeOnSizeChange bool
		FixedHight               bool
	}{
		Path:                     "",
		SwitchingTime:            10,
		RefetchTime:              60,
		ReloadIframeOnSizeChange: false,
		FixedHight:               false,
	},
	ScrollText: struct {
		Path        string
		Texts       []string
		RefetchTime uint
	}{
		Path:        "",
		Texts:       []string{"Hello", "World"},
		RefetchTime: 60,
	},
	WebServer: struct {
		ServerAddress string
	}{
		ServerAddress: ":8080",
	},
}

// Function to create a default config file if it doesn't exist and no env vars are set
func createDefaultConfigFile(configPath string) error {
	configData, err := yaml.Marshal(&Config)
	if err != nil {
		return fmt.Errorf("error marshaling default config: %w", err)
	}

	err = os.WriteFile(configPath, configData, 0644)
	if err != nil {
		return fmt.Errorf("error writing default config file: %w", err)
	}

	fmt.Println("Default config file created at", configPath)
	return nil
}

var ConfigPath string

func LoadConfig() error {
	// Default config file path
	ConfigPath = "./config.yml"

	// If a command line argument is provided, use it as the config path
	if len(os.Args) > 1 {
		ConfigPath = os.Args[1]
	} else if os.Getenv("CONFIG_FILE") != "" {
		ConfigPath = os.Getenv("CONFIG_FILE")
	}

	// Check if all environment variables are unset, and if config file doesn't exist, create default
	if _, err := os.Stat(ConfigPath); os.IsNotExist(err) {
		fmt.Println("No environment variables set and no config file found. Creating default config file...")
		if err := createDefaultConfigFile(ConfigPath); err != nil {
			log.Fatalf("Error creating default config file: %v", err)
		}
	}

	viper.SetConfigFile(ConfigPath)
	Config.ScrollText.Texts = nil
	// Read the config file if it exists
	if _, err := os.Stat(ConfigPath); err == nil {
		if err := viper.ReadInConfig(); err != nil {
			return fmt.Errorf("error reading config file: %w", err)
		}
	}

	// Parse config into the provided struct
	if err := viper.Unmarshal(&Config); err != nil {
		return fmt.Errorf("unable to decode into struct: %w", err)
	}

	return nil
}
func WatchConfig(configPath string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Error creating file watcher: %v", err)
	}
	defer watcher.Close()

	err = watcher.Add(configPath)
	if err != nil {
		log.Fatalf("Error adding config file to watcher: %v", err)
	}

	log.Println("Watching for config file changes...")

	// Load initial configuration
	var lastKnownConfig = Config
	if err := LoadConfig(); err != nil {
		log.Fatalf("Initial config load failed: %v", err)
	}

	// Start a ticker for debouncing
	ticker := time.NewTicker(debounceDelay)
	defer ticker.Stop()

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			// Check if the event is a write event
			if event.Op&fsnotify.Write == fsnotify.Write {
				// Check the file modification time
				fileInfo, err := os.Stat(configPath)
				if err != nil {
					log.Printf("Error getting file info: %v", err)
					continue
				}

				if fileInfo.ModTime().After(lastModTime) {
					// Update last modification time
					lastModTime = fileInfo.ModTime()

					// Wait for the debounce period before reloading
					<-ticker.C

					log.Println("Config file changed, reloading...")
					tempConfig := lastKnownConfig
					if err := LoadConfig(); err != nil {
						log.Printf("Error reloading config: %v\n", err)
						Config = tempConfig // Revert to the last known good config
						log.Println("Reverted to last known good config.")
					} else {
						lastKnownConfig = Config // Update last known good config
						log.Println("Config reloaded successfully.")
					}
				}
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Printf("Watcher error: %v\n", err)
		}
	}
}
