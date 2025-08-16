import { createInquiry, getInquiries } from "../api/inquiry";

// Create new inquiry (public)
async function handleSubmit() {
  try {
    const newInquiry = await createInquiry({
      property: 1, // property id
      name: "John Doe",
      email: "john@example.com",
      phone: "0712345678",
      message: "I am interested in this property"
    });
    console.log("Inquiry submitted:", newInquiry);
  } catch (err) {
    console.error(err.message);
  }
}

// Fetch inquiries (auth required)
async function fetchInquiries() {
  try {
    const list = await getInquiries();
    console.log("Inquiries:", list);
  } catch (err) {
    console.error(err.message);
  }
}
