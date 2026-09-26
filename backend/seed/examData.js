const mongoose = require("mongoose");
const dotenv = require("dotenv");

const ExamSchedule =
    require("../models/ExamSchedule");

dotenv.config();


// ========================================
// VERIFIED EXAM DATA
// ========================================

const examData = [

    // ========================================
    // TNPSC
    // ========================================

    {
        examName: "TNPSC",

        examGroup: "Group 1",

        attemptYear: 2027,

        notificationDate: null,

        examDate: null,

        minimumAge: 21,

        maximumAge: null,

        educationQualification:
            "Degree from a recognized university",

        eligibilityNotes:
            "Age, qualification and other conditions are subject to the official TNPSC notification.",

        sourceUrl:
            "https://www.tnpsc.gov.in/",

        lastVerified:
            new Date()
    },


    // ========================================
    // SSC CGL
    // ========================================

    {
        examName: "SSC",

        examGroup: "CGL",

        attemptYear: 2026,

        notificationDate: null,

        examDate: null,

        minimumAge: 18,

        maximumAge: 32,

        educationQualification:
            "Bachelor's Degree",

        eligibilityNotes:
            "Age limit varies according to the post. Candidates must check the official SSC notification for the exact post-wise requirement.",

        sourceUrl:
            "https://ssc.gov.in/",

        lastVerified:
            new Date()
    }

];


// ========================================
// SEED DATABASE
// ========================================

async function seedExamData() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB Connected"
        );


        // ========================================
        // INSERT / UPDATE RECORDS
        // ========================================

        for (
            const exam of examData
        ) {

            await ExamSchedule.findOneAndUpdate(

                {
                    examName:
                        exam.examName,

                    examGroup:
                        exam.examGroup,

                    attemptYear:
                        exam.attemptYear
                },

                exam,

                {
                    upsert: true,

                    new: true,

                    runValidators: true
                }
            );

        }


        console.log(
            "Exam data inserted successfully"
        );


        await mongoose.connection.close();


        console.log(
            "MongoDB connection closed"
        );


    } catch (error) {

        console.error(
            "Exam Data Error:",
            error
        );

        process.exit(1);
    }
}


seedExamData();