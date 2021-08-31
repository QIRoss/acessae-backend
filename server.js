const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const getLighthouseaccessibilityScore = require('./lighthouseApp')

const app = express();

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const lighthouseaccessibilitySchema = new mongoose.Schema({
    accessibility: Number,
    searches: {
            type: Number,
            default: 1
        },
    usersVoted: {type: Number},
    userScore: {type: Number},
    comments: {
        type: Array,
        default: []
    },
    url: String
});

const Lighthouseaccessibility = mongoose.model('Lighthouseaccessibility', lighthouseaccessibilitySchema);

app.use('/public', express.static(process.cwd() + '/public'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.route('/api/accessibility')
    .get((req, res) => {
        Lighthouseaccessibility.find({}, (err, data) => {
            res.json(data);
        });
    })
    .post(async (req, res) => {
        const url = req.body.url;
        console.log(url)

        const lighthouseResults = await getLighthouseaccessibilityScore(url);

        Lighthouseaccessibility.findOneAndUpdate(
            {url: lighthouseResults.finalUrl}, 
            {accessibility: lighthouseResults.accessibilityScore, $inc: {searches: 1}}, 
            {useFindAndModify: false, new: true}, 
            (err, data) => {
                if (!data){
                    data = new Lighthouseaccessibility({
                        url: lighthouseResults.finalUrl,
                        accessibility: lighthouseResults.accessibilityScore 
                    });
                    data.save((err) => {
                        if(!err){
                            console.log("New site accessibility created")
                        }
                    });
                } else {
                    data.save((err) => {
                        if(!err){
                            console.log("Update success");
                        }
                    });
                }
                res.json(data);
            });
        // res.json(lighthouseResults);
});

app.listen(3001, () => {
    console.log("server is online");
})