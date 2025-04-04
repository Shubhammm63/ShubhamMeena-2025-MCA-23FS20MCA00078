import cron from "node-cron";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";



export const newsLetterCron = ()=>{
    cron.schedule("*/1 * * * *", async ()=> {
        const jobs = await Job.find({newsLettersSend : false});
        for(const job of jobs){
            try {
                const filteredUsers = await User.find({
                    $or : [
                        {"niches.firstNiche" : job.jobNiche},
                        {"niches.secondNiche" : job.jobNiche},
                        {"niches.thirdNiche" : job.jobNiche},                 
                   ],
                });
                for(const user of filteredUsers){
                    const subject = `New Job Openings Tailored for You : ${job.title} in ${job.jobNiche} Available Now `;
                    const message = `Hello ${user.name},\n\nGreat news! We’ve handpicked exciting job opportunitie that match your skills and preferences!Explore these top roles and take a step closer to your dream career.The position is for a ${job.title} with ${job.companyName}, they are looking to hire immediately.\n\nJob Details :\nPosition :${job.title}\nCompany:${job.companyName}\nLocation:${job.location}\nSalary:${job.salary}\n\n Don’t wait—opportunities like these fill up fast.Visit JobHeaven today and secure your next career move!\n\nWarm regards,\nThe JobHeaven Team `;
                    sendEmail({
                        email : user.email,
                        subject,
                        message,
                    });
                }

                job.newsLettersSend = true;
                await job.save();

            } catch (error) {
                console.log("Error in node cron catch block.");
                return next(console.error(error || "Some error in cron."));
            }
        }
    });
};