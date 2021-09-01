const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const getLighthouseaccessibilityScore = require('./lighthouseApp');
const atob = require('atob');
// const btoa = require('btoa');

const app = express();

app.use(cors({origin: '*'}));

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const lighthouseaccessibilitySchema = new mongoose.Schema({
    accessibility: Number,
    searches: {
            type: Number,
            default: 1
        },
    usersVoted: {
        type: Array,
        default: []
    },
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
        console.log(lighthouseResults);
        try {
            Lighthouseaccessibility.findOneAndUpdate(
                {url: lighthouseResults.finalUrl}, 
                {$set: {accessibility: lighthouseResults.accessibilityScore}, $inc: {searches: 1}}, 
                {useFindAndModify: false, new: true}, 
                (err, data) => {
                    if (!data){
                        data = new Lighthouseaccessibility({
                            url: lighthouseResults.finalUrl,
                            accessibility: lighthouseResults.accessibilityScore 
                        });
                        data.save((err) => {
                            if(!err){
                                console.log("New site accessibility created");
                            }
                        });
                    } else {
                        data.save((err) => {
                            if(!err){
                                console.log("Update success");
                            }
                        });
                    }
                    res.status(200).json({url: lighthouseResults.finalUrl});
                });
        } catch(e) {
            res.status(500).send(e);
        }
});

app.route("/api/accessibility/:url")
    // .get(async (req,res) => {
    //     // console.log(btoa("https://example.com/"),req.params.url );
    //     const url = atob(req.params.url);
    //     // console.log(url);
    //     const urlResponse = await Lighthouseaccessibility.findOne({"url": url});
    //     res.json(urlResponse);
    // });
    .get(async (req, res) => {
        const url = decodeURIComponent(req.params.url);

        const lighthouseResults = await getLighthouseaccessibilityScore(url);
        console.log(lighthouseResults);
        try {
            Lighthouseaccessibility.findOneAndUpdate(
                {url: lighthouseResults.finalUrl}, 
                {$set: {accessibility: lighthouseResults.accessibilityScore}, $inc: {searches: 1}}, 
                {useFindAndModify: false, new: true}, 
                (err, data) => {
                    if (!data){
                        data = new Lighthouseaccessibility({
                            url: lighthouseResults.finalUrl,
                            accessibility: lighthouseResults.accessibilityScore 
                        });
                        data.save((err) => {
                            if(!err){
                                console.log("New site accessibility created");
                            }
                        });
                    } else {
                        data.save((err) => {
                            if(!err){
                                console.log("Update success");
                            }
                        });
                    }
                    res.status(200).json(data);
                });
        } catch(e) {
            res.status(500).send(e);
        }
    });

app.route("/api/uservote/")
    .post(async (req, res) => {
        const [email, userScore, url] = [req.body.email, req.body.userScore, req.body.url];
        try {
            Lighthouseaccessibility.findOneAndUpdate(
                {url: url},
                {
                    "$push": {
                        usersVoted:{
                            email:email, 
                            userScore:userScore
                        }
                    }
                },
                {useFindAndModify: false},
                (err, data) => {
                    if(err){
                        res.status(400).send(err);
                        return;
                    }
                    if(!data){
                        res.status(400).send("Data not found");
                        return;
                    }
                    res.status(200).json(data);
                });
        } catch(e) {
            res.status(500).send(e);
        }
    });

app.listen(3001, () => {
    console.log("Server online on port 3001");
});