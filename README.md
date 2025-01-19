# 🚀 **How to Use the Extension**  



## 1. **Setup and Installation** 🛠️

### 📦 **Install the Extension**
Make sure the extension is installed and running in your **VS Code** environment. 🔥

### 🗂️ **Create a Workspace**
Open or create a folder (workspace) where you will be working on your **LeetCode** problems and **C++/Python** solutions.

### ✅ **Ensure Test Cases File Exists**
Before running your code, ensure that the test cases and expected outputs are generated correctly. 📄

---

## 2. **Fetching Test Cases from LeetCode** 📡

### 📝 **Command**: `extension.getLeetCodeTestCases`

### **How to Use**:  
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the **Command Palette**. 🎨  
2. Type **"Fetch LeetCode Test Cases"** or `extension.getLeetCodeTestCases` and hit enter.  
3. Paste the **LeetCode URL** (for a specific problem) when prompted. 🌐  
4. The extension will fetch the test cases from **LeetCode's API**, process them, and save them as `test_cases.txt` and `expected_outputs.txt` in your workspace folder.

### 🔍 **What Happens**:  
The extension will:
- Decode any **HTML entities**.
- Format the **test cases** and **expected outputs**.
- Save them as text files in your workspace.

---

## 3. **Running the Code (C++ or Python)** ▶️

### 📝 **Command**: `extension.runExtension`

### **How to Use**:  
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) again.  
2. Type **"Run Extension"** or `extension.runExtension`.  
3. The extension will first check for the `test_cases.txt` file and the corresponding solution file (`solution.cpp` for C++ or `solution.py` for Python).  
4. It will **compile** or **run** the code based on the selected language.
5. The code will run with the test cases as input, and it will compare the actual output with the expected output from `expected_outputs.txt`.

### 🔍 **What Happens**:  
- **For C++**: The code will be compiled and run with the test cases. 💻  
- **For Python**: The Python script will be executed directly with the test cases. 🐍  
The extension will check if the output matches the expected output and notify you accordingly. ✅

---

## 4. **Configuring the Language (C++/Python)** ⚙️

### **How to Configure**:  
1. Open your **VS Code settings**.  
2. Go to **Preferences → Settings** or press `Ctrl+,` or `Cmd+,`.  
3. In the search bar, type **"leetcode"**.  
4. Look for the **language settings** and set your preferred language to **C++** or **Python** based on the language you're using.

---

## 5. **Saving and Checking Outputs** 💾

- The extension saves the outputs in separate files (e.g., `solution_output.txt`) based on the code language.
- The output is compared to the expected output, and results are shown in the **VS Code status bar** or in a **message box**. 💬

---

## 6. **Handling Errors** ⚠️

- **Issues Fetching Test Cases**: If there are issues with fetching the test cases, you'll be notified with an error message. 🚨
- **Compilation or Execution Failures**: An error message will show where the issue lies (e.g., missing file, incorrect command).

---

## 7. **Important Notes** 📌

- Make sure you have the correct files:
  - **`solution.cpp`** for C++ or **`solution.py`** for Python in your workspace folder.  
- Ensure the **LeetCode problem URL** you enter is in the correct format and corresponds to an existing LeetCode problem.

---

## 8. **Regarding the Driver Code** 🏁

- I’m providing a **basic driver code** in the dummy file for you to modify slightly if required.  
- Since the inputs are clearly visible, feel free to alter them as per your convenience.

---

Hope this helps! Happy coding! 😄
