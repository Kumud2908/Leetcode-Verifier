#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    string intToRoman(int num) {
        // Roman numerals for each digit place
        vector<vector<pair<int, char>>> roman = {
            {{1, 'I'}, {5, 'V'}},       // Ones place
            {{10, 'X'}, {50, 'L'}},     // Tens place
            {{100, 'C'}, {500, 'D'}},   // Hundreds place
            {{1000, 'M'}, {5000, 'V'}}  // Thousands place
        };

        // Special cases for values like 4, 9, 40, 90, 400, 900, etc.
        vector<vector<pair<int, string>>> special = {
            {{4, "IV"}, {9, "IX"}},     // Ones place
            {{40, "XL"}, {90, "XC"}},   // Tens place
            {{400, "CD"}, {900, "CM"}}, // Hundreds place
            {{4000, "IV"}, {9000, "IM"}} // Thousands place
        };

        string result = "";
        int place = 0; // Start from the ones place
        while (num > 0) {
            int digit = num % 10;  // Get the last digit (ones, tens, etc.)
            num /= 10;             // Remove the last digit

            // Handle special cases first (e.g., 4, 9, 40, 90, 400, 900, etc.)
            if (digit == 4 || digit == 9) {
                result = special[place][digit / 5].second + result;
            } else if (digit >= 5) {
                result = roman[place][1].second + string(digit - 5, roman[place][0].second) + result;
            } else {
                result = string(digit, roman[place][0].second) + result;
            }

            place++; // Move to the next place (tens, hundreds, etc.)
        }

        return result;
    }
};

int main() {
    int num;
    Solution solution;

    // Keep reading input until EOF or empty line
    while (true) {
        // cout << "Enter an integer (or 0 to exit): ";
        cin >> num;
        if (num == 0) break;  // Exit on 0 input
        
        // Solve the problem
        string result = solution.intToRoman(num);

        // Print the result
        cout<< result << endl;
    }

    return 0;
}
