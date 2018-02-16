let CHARACTERS = [
    ".", "\\w", "\\d", "\\s", "\\W", "\\D", "\\S", "\\.", "\\b", "\\B",
    "\\*", "\\\\", "@", "`", ":", "\\?", "!", "\\^", "\\$", "\\(", "\\)",
    "%", "#", '"', "'", "\\[", "\\]", "\\+", "_", "\\{", "\\}"
]

// Add more letters and numbers to potential characters
for (let i = 48; i < 63; i++) {
    CHARACTERS.push(String.fromCharCode(i))
}

for (let i = 64; i < 91; i++) {
    CHARACTERS.push(String.fromCharCode(i))
}

for (let i = 97; i < 123; i++) {
    CHARACTERS.push(String.fromCharCode(i))
}


module.exports = CHARACTERS