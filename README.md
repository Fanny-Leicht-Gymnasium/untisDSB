![WAKA-Time](https://waka.toomanyfiles.dev/api/badge/Mr-Comand/interval:any/project:untisDSB)

# UntisDSB

UntisDSB is a companion tool for WebUntis, designed to enhance the monitor screen functionality by adding color coding, removing unnecessary elements (like "Bitte Aufstuhlen"), improving scrolling behavior, and ensuring a responsive layout. This project provides both a backend system for timetable and advertisement management and browser-based enhancements via Tampermonkey scripts. All modules, as well as the backend, can be used independently of each other.

Note: The Auto Scroll Script is required to re-enable scrolling functionality if the Remove Bitte Aufstuhlen Script is used, as it ensures that scrolling is re-implemented to work with changing content.

---

## Table of Contents
1. [Features](#features)
2. [Backend Setup](#backend-setup)
3. [Backend Configuration](#configuration)
5. [Tampermonkey Scripts](#tampermonkey-scripts)
6. [Contributing](#contributing)
7. [License](#license)

---

## Features
- Enhances WebUntis monitor views with:
  - **Color coding** for better timetable visibility.
  - Removal of "Bitte Aufstuhlen" elements for a cleaner interface.
  - Improved scrolling behavior for smoother displays.
  - Responsive layout fixes for rezizing a screen.
- Backend system for managing:
  - Advertisements (with customizable switching times and paths).
  - Scrolling text (e.g., announcements).
  - Timetables for today and tomorrow.

---

## Backend Setup

### 1. **Backend Installation**
1. **Download the latest binary**:
   Visit the [Releases](https://github.com/Fanny-Leicht-Gymnasium/untisDSB/releases) page and download the appropriate backend binary for your platform.


2. **Run the binary**:
   ```bash
   ./untisDSB
   ```

3. **Optional: Build from source**:
   If you want to build from source, ensure [Go](https://golang.org/dl/) is installed and run:
   ```bash
   git clone https://github.com/Fanny-Leicht-Gymnasium/untisDSB.git
   cd untisDSB
   go build -o untisDSB
   ```

---

## Configuration

The server requires a YAML configuration file. Below is an example:

```yaml
Advertisement:
    FixedHight: false
    Fullscreen: false
    Path: ""
    RefetchTime: 60
    ReloadIframeOnSizeChange: false
    SwitchingTime: 10
ScrollText:
    Path: ""
    RefetchTime: 60
    Texts:
        - Hello
        - World
Untis:
    TodayURL: https://example.com/today
    TomorrowURL: https://example.com/tomorrow
WebServer:
    ServerAddress: :8080
```

### Configuration Details
1. **Advertisement**:
   - `FixedHeight`: Enable or disable fixed-height advertisements (if false, `Auto Scroll Script` is recommended).
   - `Fullscreen`: Display advertisements in fullscreen mode.
   - `Path`: Path to advertisement images or HTML files.
   - `RefetchTime`: Time interval (in seconds) to fetch new advertisement data.
   - `ReloadIframeOnSizeChange`: Reload iframe if advertisement size changes.
   - `SwitchingTime`: Time (in seconds) to switch between advertisements.

2. **ScrollText**:
   - `Path`: Path to scrolling text data.
   - `RefetchTime`: Time interval (in seconds) to fetch new scrolling text.
   - `Texts`: List of static texts for scrolling.

3. **Untis**:
   - `TodayURL`: URL to fetch today's timetable.
   - `TomorrowURL`: URL to fetch tomorrow's timetable.

4. **WebServer**:
   - `ServerAddress`: Address and port for the backend server.

---

## Running the Server

1. Place the `config.yaml` file in the same directory as the binary.
2. Start the server:
   ```bash
   ./untisDSB
   ```
3. The server will listen on the address defined in `ServerAddress`.

---

## Tampermonkey Scripts

Tampermonkey scripts enhance the WebUntis monitor screen by adding color coding, cleaning up unnecessary elements, and fixing scrolling and responsiveness.

### Installation
1. **Install Tampermonkey**:
   - Chrome: [Tampermonkey Chrome Extension](https://www.tampermonkey.net/?ext=dhdg&browser=chrome)
   - Firefox: [Tampermonkey Firefox Add-on](https://www.tampermonkey.net/?ext=dhdg&browser=firefox)

2. **Download the scripts**:
   The following scripts are available on the [Releases](https://github.com/Fanny-Leicht-Gymnasium/untisDSB/releases) page (as a static version) or in the `tampermonkey` folder (with automatic updates):

   - [Auto Scroll Script](https://github.com/Fanny-Leicht-Gymnasium/untisDSB/raw/main/tampermonkey/auto-scroll.user.js)
   - [Coloring Script](https://github.com/Fanny-Leicht-Gymnasium/untisDSB/raw/main/tampermonkey/coloring.user.js)
   - [Remove Bitte Aufstuhlen Script](https://github.com/Fanny-Leicht-Gymnasium/untisDSB/raw/main/tampermonkey/removeBitteAufstuhlen.user.js)

3. **Install the scripts**:
   - click on install to install the script.
  

### Script Descriptions
1. **Auto Scroll Script**:
   - Automatically scrolls through timetable data, ensuring smooth navigation.
   - Re-implements scrolling to work with window resizing.
   - **Recommended if** the Advertisement -> FixedHeight setting is false.

2. **Coloring Script**:
   - Adds color coding to timetables for better readability and a more visually appealing layout.

3. **Remove Bitte Aufstuhlen Script**:
   - Removes "Bitte Aufstuhlen" messages from the WebUntis monitor display.
   - **Note**: This script will disable automatic scrolling functionality unless the `Auto Scroll Script` is also used.

---

## Contributing

We welcome contributions! Fork this repository, make your changes, and submit a pull request. Ensure your code adheres to project guidelines.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
