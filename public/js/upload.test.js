// upload.test.js
// const calculateSpeed = require('./upload');
const { calculateSpeed } = require('./upload'); // Adjust the path as needed


test('calculates correct upload speed', () => {
    expect(calculateSpeed(1000, 10)).toBe(100); // Assuming 1000 bytes in 10 seconds
});

describe("File selection functionality", () => {
    test("changes appearance when a file is dragged over", () => {
        // Mock dragover event and assert changes in the drop area appearance
    });

    test("displays file name and icon when a file is dropped", () => {
        // Mock drop event and assert file name and icon are displayed
    });

    test("displays file name and icon when a file is selected via click", () => {
        // Mock file selection and assert file name and icon are displayed
    });

    test("returns to normal appearance when a file is dragged out", () => {
        // Mock dragleave event and assert drop area returns to normal appearance
    });
});

describe("Upload process", () => {
    test("initiates upload when 'upload' button is clicked", () => {
        // Mock upload button click and assert upload process is initiated
    });
});

