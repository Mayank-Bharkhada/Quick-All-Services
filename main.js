const dotenv = require("dotenv");
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const hbs = require('hbs');
const jwt = require('jsonwebtoken');
const bcryptjs = require("bcryptjs");
const cookieParser = require("cookie-parser");
const nodemailer = require('nodemailer');
const Vonage = require('@vonage/server-sdk');
const multer = require('multer');
const fs = require("fs");
const validator = require('mongoose-validator');
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
	key_id: 'rzp_test_FXhwoXBpqRvTcg',
	key_secret: 'p9VWK60saIMUM96RgmRqNyKQ'
});

const app = new express();
dotenv.config({ path: './config.env' });

const Port = process.env.PORT;

//Upload profile picture

const Storage = multer.diskStorage({
	destination: (req, file, cb) => { // setting destination of uploading files        
		if (file.fieldname === "Photo1") { // if uploading resume
			cb(null, "./templates/views/photo/related_photos");
		} else if (file.fieldname === "Photo2") {
			cb(null, "./templates/views/photo/related_photos");
		} else if (file.fieldname === "Photo3") {
			cb(null, "./templates/views/photo/related_photos");
		} else {
			cb(null, "./templates/views/photo");
		}
	},
	filename: async (req, file, cb) => {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		// naming file
		if (file.fieldname === "Photo1") { // if uploading resume
			cb(null, verifyUser.NUMBER + "1" + path.extname(file.originalname));
		} else if (file.fieldname === "Photo2") {
			cb(null, verifyUser.NUMBER + "2" + path.extname(file.originalname));
		} else if (file.fieldname === "Photo3") {
			cb(null, verifyUser.NUMBER + "3" + path.extname(file.originalname));
		} else {
			console.log(file);
			const TODAY_DATE = new Date();
			const DAY = TODAY_DATE.getDate();
			const MONTH = TODAY_DATE.getMonth() + 1;
			const YEAR = TODAY_DATE.getFullYear();
			const Minutes = TODAY_DATE.getMinutes();
			const Name = path.parse(file.originalname).name;

			const token = req.cookies.jwt;
			const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
			console.log(verifyUser);
			const data = await user.find({ _id: verifyUser._id });

			if (data[0]['PHOTO'] != "0") {
				const pathToFile = data[0]['PHOTO'];

				fs.unlink(`./templates/views/photo/${pathToFile}`, (err) => {
					if (err) {
						throw err
					} else {
						console.log("Successfully deleted the file.");
					}
				})
			}
			const update = await user.update({ _id: verifyUser._id }, { $set: { PHOTO: file.fieldname + '_' + Name + DAY + MONTH + YEAR + Minutes + path.extname(file.originalname) } });

			cb(null, file.fieldname + '_' + Name + DAY + MONTH + YEAR + Minutes + path.extname(file.originalname));
		}
	}

});

const imageUpload = multer({ storage: Storage })

//done uploading

//Upload bill offline picture


const Storage_bill = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./templates/views/bills");
	},
	filename: async (req, file, cb) => {
		console.log(file);
		const token_bill = req.cookies.jwt_bill;
		const verifyUser = jwt.verify(token_bill, process.env.SERECTKEY_BILL);
		console.log("-------------");
		console.log(verifyUser);
		console.log("-------------");

		const Code = verifyUser.CODE;
		console.log(Code);

		cb(null, file.fieldname + '_' + Code + path.extname(file.originalname))
	}
});

const imageUpload_bill = multer({ storage: Storage_bill })


//done offline bill photo uploading


//Upload online bill picture


const Storage_online_bill = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./templates/views/online_bills");
	},
	filename: async (req, file, cb) => {
		console.log(file);

		try {

			const Code = req.body.Code;

			cb(null, file.fieldname + '_' + Code + path.extname(file.originalname))
		} catch (e) {
			console.log(e);
		}

	}
});

const imageUpload_online_bill = multer({ storage: Storage_online_bill })


//done online bill photo uploading


//send messages

const vonage = new Vonage({
	apiKey: "a0a4ed75",
	apiSecret: "LKNSDhOoUCo6GVJt"
})


//email sned

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: 'Chmkjj11'
	}
})

//connection to user collection
mongoose.connect(process.env.DATABASE, {
	useNewUrlParser: true
});

const UserSchema = new mongoose.Schema({
	NUMBER: {
		type: Number,
		trim: true,
		required: true,
		unique: true
	},
	NAME: {
		type: String,
		trim: true,
		required: true
	},
	PHOTO: {
		type: String,
		trim: true,
		required: true,
		default: "0"
	},
	EMAIL: {
		type: String,
		trim: true,
		validate: [
			validator({
				validator: 'isEmail',
				message: 'Oops..please enter valid email'
			})
		],
		required: true
	},
	ACCOUNT_TYPE: {
		type: String,
		trim: true,
		required: true,
		default: "User"
	},
	PROFESSION: {
		type: String,
		trim: true,
		required: false
	},
	EXPERIENCE: {
		type: Number,
		trim: true,
		required: false
	},
	GENDER: {
		type: String,
		trim: true,
		required: true
	},
	AGE: {
		type: String,
		trim: true,
		required: true
	},
	PASSWORD: {
		type: String,
		trim: true,
		required: true
	},
	ADHARCARD_NUMBER: {
		type: Number,
		trim: true,
		required: false
	},
	STATE: {
		type: String,
		trim: true,
		required: false,
		default: "UPDATE YOUR ACCOUNT"
	},
	COUNTRY: {
		type: String,
		trim: true,
		required: false,
		default: "UPDATE YOUR ACCOUNT"
	},
	PINCODE: {
		type: Number,
		trim: true,
		required: false,
		default: 0
	},
	DESCRIPTION: {
		type: String,
		trim: true,
		required: false,
		default: "UPDATE YOUR ACCOUNT"
	},
	VARIFICATION_REQUEST: {
		type: Number,
		trim: true,
		required: true,
		default: 0
	},
	VARIFIED: {
		type: Number,
		trim: true,
		required: true,
		default: 0
	},
	BLOCK: {
		type: Number,
		trim: true,
		required: true,
		default: 0
	},
	ACTIVE: {
		type: Number,
		trim: true,
		required: true,
		default: 1
	},
	TOKENS: [{
		tokens: {
			type: String,
			required: true
		}
	}],
	PAYMENT_DONE: {
		type: Number,
		required: true,
		default: 0
	},
	DAY: {
		type: Number,
		required: true,
		default: 0
	},
	MONTH: {
		type: Number,
		required: true,
		default: 0
	},
	YEAR: {
		type: Number,
		required: true,
		default: 0
	},
	SUCCESS_RATE_LEFT: {
		type: Number,
		required: true,
		default: 5
	},
	SUCCESS_RATE_RIGHT: {
		type: Number,
		required: true,
		default: 0
	},
	TOTAL_RATTINGS: {
		type: Number,
		required: true,
		default: 0
	},
	LAST_LOCATION_LATITUDE: {
		type: Number,
		required: true,
		default: 0
	},
	LAST_LOCATION_LONGITUDE: {
		type: Number,
		required: true,
		default: 0
	}
})

const user = new mongoose.model('user', UserSchema);

//connection to finds collection

const findSchema = new mongoose.Schema({
	NAME: {
		type: String,
		trim: true,
		required: true
	},
	NUMBER: {
		type: Number,
		trim: true,
		required: true,
	},
	PINCODE: {
		type: Number,
		trim: true,
		required: true
	},
	TEXT: {
		type: String,
		trim: true,
		required: false
	},
	HIRED: {
		type: Number,
		trim: true,
		required: true,
		default: 0
	},
	PAYMENT_DONE: {
		type: Number,
		trim: true,
		required: true,
		default: 0
	},
	TODAY_DATE: [{
		DAY: {
			type: Number,
			trim: true,
			required: true
		},
		MONTH: {
			type: Number,
			trim: true,
			required: true
		},
		YEAR: {
			type: Number,
			trim: true,
			required: true
		},
		SEC: {
			type: Number,
			trim: true,
			required: true
		},
	}],
	CONNECTED: [{
		NAME: {
			type: String,
			trim: true,
			required: false
		},
		NUMBER: {
			type: Number,
			trim: true,
			required: false
		},
		EMAIL: {
			type: String,
			trim: true,
			validate: [
				validator({
					validator: 'isEmail',
					message: 'Oops..please enter valid email'
				})
			],
			required: false
		},
		PINCODE: {
			type: Number,
			trim: true,
			required: false
		},
	}],
	CONNECTED_NUMBER: {
		type: Number,
		trim: true,
		required: false
	},
	CODE: {
		type: Number,
		trim: true,
		required: false
	},
	LATITUDE: {
		type: Number,
		required: true,
		default: 0
	},
	LONGITUDE: {
		type: Number,
		required: true,
		default: 0
	}
})

const find = new mongoose.model('find', findSchema);

//connection to review 

const feedbackSchema = new mongoose.Schema({
	NAME: {
		type: String,
		trim: true,
		required: true
	},
	EMAIL: {
		type: String,
		trim: true,
		validate: [
			validator({
				validator: 'isEmail',
				message: 'Oops..please enter valid email'
			})
		],
		required: true,
	},
	TEXT: {
		type: String,
		trim: true,
		required: true,
	}
})

const feedback = new mongoose.model('feedback', feedbackSchema);

//connection to feedback

const reviewSchema = new mongoose.Schema({
	PROFESSIONAL_NUMBER: {
		type: String,
		trim: true,
		required: true
	},
	USER_NAME: {
		type: String,
		trim: true,
		required: true
	},
	RATE: {
		type: Number,
		trim: true,
		required: true
	},
	TEXT: {
		type: String,
		trim: true,
		required: true,
	}
})

const review = new mongoose.model('review', reviewSchema);
//

const static_path = path.join(__dirname, "/templates");
const templates_path = path.join(__dirname, "/templates/views");
const partials_path = path.join(__dirname, "/templates/partials");

app.set('view engine', 'hbs');
app.set('views', templates_path);
hbs.registerPartials(partials_path);

app.use(cookieParser());
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ NUMBER: verifyUser.NUMBER });

		if (verifyUser.NUMBER === data[0]['NUMBER'] && data[0]['BLOCK'] == 0) {
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			console.log(data[0]['ACTIVE'])
			console.log(data[0]['ACCOUNT_TYPE']);
			console.log(data[0]['BLOCK'] == 0);
			if (data[0]['ACTIVE'] === 1 && data[0]['ACCOUNT_TYPE'] === "Professional" && data[0]['BLOCK'] == 0) {
				const None = "";
				const Active_hidden = "";
				const Active = "/deactive";
				const Activation_status = "Your account is on activated mode make deactivated by clicking the deactivate button";
				const Activation_button = "DEACTIVATE THE ACCOUNT";
				return res.status(201).render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden, ACTIVATION_STATUS: Activation_status, ACTIVATION_BUTTON: Activation_button, ACTIVE: Active });
			} else if (data[0]['ACTIVE'] === 0 && data[0]['ACCOUNT_TYPE'] === "Professional" && data[0]['BLOCK'] == 0) {
				const None = "";
				const Active_hidden = "";
				const Active = "/active";
				const Activation_status = "Your account is on deactivated mode make activated by clicking the activate button";
				const Activation_button = "ACTIVATE THE ACCOUNT";
				return res.status(201).render("data", { LOGIN: login_status, Logout_link: logout_link, ACTIVE: Active, ACTIVATION_STATUS: Activation_status, ACTIVATION_BUTTON: Activation_button, NONE: None, ACTIVE_HIDDEN: Active_hidden });
			} else {
				const None = "none";
				const Active_hidden = "hidden";
				return res.render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden });
			}
		} else {
			const None = "none";
			const login_status = "LOGIN";
			const logout_link = "/login_form";
			const Active_hidden = "hidden";
			return res.status(200).render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden });
		}
	} catch (e) {
		console.log(e);
		const None = "none";
		const login_status = "LOGIN";;
		const logout_link = "/login_form"
		const Active_hidden = "hidden";
		return res.status(500).render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden });
	}
})

app.get('/active', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);

		const data_active_update = await user.update({ NUMBER: verifyUser['NUMBER'] }, { $set: { ACTIVE: 1 } });
		console.log(data_active_update);

		return res.status(201).redirect("/");

	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/login_form")
	}
})


app.get('/deactive', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		console.log(verifyUser['NUMBER']);

		const data_active_update = await user.update({ NUMBER: verifyUser['NUMBER'] }, { $set: { ACTIVE: 0 } });
		console.log(data_active_update);

		return res.status(201).redirect("/");

	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/login_form")
	}
})

app.post('/start_getting', async (req, res) => {

	try {
		const Pincode = req.body.Pincode;
		console.log(Pincode);
		const TODAY_DATE = new Date();
		const DAY = TODAY_DATE.getDate();
		console.log(DAY);
		const MONTH = TODAY_DATE.getMonth() + 1;
		console.log(MONTH);
		const YEAR = TODAY_DATE.getFullYear();
		console.log(YEAR);
		const SEC = Date.now();
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ _id: verifyUser._id });


		const finds = new find({
			NAME: data[0]['NAME'],
			NUMBER: data[0]['NUMBER'],
			PINCODE: Pincode,
			TODAY_DATE: [{ DAY: DAY, MONTH: MONTH, YEAR: YEAR, SEC: SEC }]
		});


		const result = await finds.save();

		if (data[0]['ACCOUNT_TYPE'] === "User" && data[0]['BLOCK'] == 0) {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.render("getting_consultant", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("getting_consultant", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		}
	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/login_form")
	}
})


app.get('/related_profession', async (req, res) => {
	try {

		const TYPE = req.query.TYPE;
		console.log(TYPE);

		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ _id: verifyUser._id });
		console.log(data);


		if (data[0]['ACCOUNT_TYPE'] === "User" && data[0]['BLOCK'] == 0) {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("consult_before", { LOGIN: login_status, Logout_link: logout_link, NONE: None, TYPE: TYPE });
		} else if (data[0]['ACCOUNT_TYPE'] === "Professional" && data[0]['BLOCK'] == 0) {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("consult_before", { LOGIN: login_status, Logout_link: logout_link, NONE: None, TYPE: TYPE });
		} else {
			return res.status(400).redirect("/")
		}
	} catch (e) {
		console.log(e);
		return res.status(400).redirect("/login_form")
	}

})


app.post('/related_profession', async (req, res) => {

	try {
		const TYPE = req.body.TYPE;
		console.log(TYPE);

		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data_users = await user.find({ _id: verifyUser._id });
		console.log(data_users);

		const data_finds = await find.find({ NUMBER: data_users[0]['NUMBER'] }).limit(1).sort({ $natural: -1 });
		console.log(data_finds);
		console.log(data_finds[0]['PINCODE']);

		const Related_professional = await user.find({ PROFESSION: TYPE, PINCODE: data_finds[0]['PINCODE'], ACTIVE: 1, VARIFIED: 1, PAYMENT_DONE: 1 });
		console.log(Related_professional);
		const otos = JSON.stringify(Related_professional);

		if (data_users[0]['ACCOUNT_TYPE'] === "User" && data_users[0]['BLOCK'] == 0) {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.render("consult", { RELATED_PROFESSIONAL: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else if (data_users[0]['ACCOUNT_TYPE'] === "Professional" && data_users[0]['BLOCK'] == 0) {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.render("consult", { RELATED_PROFESSIONAL: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
		}
		else {
			return res.status(201).redirect("/");
		}
	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/login_form");
	}
})

app.get('/pay', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const None = "none";
		return res.status(201).render("login_to_pay", { NONE: None });
	} catch (e) {
		console.log(e);
		const None = "none";
		return res.status(500).render("login_to_pay", { NONE: None });
	}
})


app.post('/pay', async (req, res) => {

	try {
		const Mobile_number = req.body.Mobile_number;
		const Password = req.body.Password;
		const Latitude = req.body.Latitude;
		const Longitude = req.body.Longitude;

		const data = await user.find({ NUMBER: Mobile_number });

		const update = await user.update({ NUMBER: Mobile_number }, { $set: { LAST_LOCATION_LATITUDE: Latitude, LAST_LOCATION_LONGITUDE: Longitude } });


		console.log(data);

		const token_pay = await jwt.sign({ NUMBER: data[0]['NUMBER'] }, process.env.SERECTKEY_PAY);
		console.log(token_pay);

		const Match_password = await bcryptjs.compare(Password, data[0]['PASSWORD']);
		console.log(Match_password);

		if (Match_password) {
			res.cookie("jwt_pay", token_pay, {
				expires: new Date(253402300000000),
				httpOnly: true
			});
			return res.status(201).redirect('/paynow');
		} else {
			const None = "";
			return res.status(500).render('login_to_pay', { NONE: None });
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "Enter valid number and password...";
		return res.status(500).render('error', { MSG: Msg });
	}
})

app.get('/paynow', async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);


		const None = "";
		const login_status = "LOGOUT";
		const logout_link = "/logout";

		return res.status(201).render("payment", { LOGIN: login_status, Logout_link: logout_link, NONE: None });

	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/pay");
	}
})


app.post('/final_pay_step', imageUpload_online_bill.single('Photo_online_bill'), async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);

		const Code = req.body.Code;
		const Amount = req.body.Amount;
		const data = await find.find({ CODE: Code });
		console.log(data[0]['CONNECTED_NUMBER']);
		const data_professional = await user.find({ NUMBER: data[0]['CONNECTED_NUMBER'] });
		const profession = data_professional[0]["PROFESSION"];

		const token_payment = await jwt.sign({ NUMBER: data[0]['CONNECTED_NUMBER'], CODE: Code, AMOUNT: Amount }, process.env.SERECTKEY_PAYMENT);
		console.log(token_payment);

		res.cookie("jwt_payment", token_payment, {
			expires: new Date(253402300000000),
			httpOnly: true
		});


		const None = "";
		const login_status = "LOGOUT";
		const logout_link = "/logout";

		return res.status(201).render("paynow", { LOGIN: login_status, Logout_link: logout_link, PROFESSION: profession, NONE: None });
		res.end();

	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error ; Enter the valid payment code...";
		return res.status(500).render("error", { MSG: Msg });
	}
})


app.post('/paying', async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);
		console.log(process.env.SERECTKEY_PAYMENT);
		const token_payment = req.cookies.jwt_payment;
		const verifypayment = jwt.verify(token_payment, process.env.SERECTKEY_PAYMENT);
		console.log(verifypayment);
		const data_profession = await user.find({ NUMBER: verifypayment['NUMBER'] });

		console.log("___________");
		console.log(verifypayment["NUMBER"]);
		console.log(data_profession);
		console.log("_______________");

		var PROFESSION = data_profession[0]["PROFESSION"];

		if (PROFESSION == "Painter") {
			var Price = 50;
		} else if (PROFESSION == "Photographer") {
			var Price = 100;
		} else {
			var Price = 150;
		}

		let options = {
			amount: Price * 100,
			currency: "INR",
		}

		razorpay.orders.create(options, (err, order) => {
			console.log(order);
			res.json(order);
		})

	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		return res.status(500).redirect("/pay");
	}
})


app.post('/pay_done', async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);
		console.log(process.env.SERECTKEY_PAYMENT);
		const token_payment = req.cookies.jwt_payment;
		const verifypayment = jwt.verify(token_payment, process.env.SERECTKEY_PAYMENT);
		console.log(verifypayment);

		console.log(verifypayment['CODE']);
		//CHANGE THE BILL IMG NAME WITH DONE//

		razorpay.payments.fetch(req.body.razorpay_payment_id).then(async (paymentDocument) => {

			if (paymentDocument.status == "captured") {

				const data_payment_update = await find.update({ CODE: verifypayment['CODE'] }, { $set: { PAYMENT_DONE: 1 } });

				//changr the file name


				fs.rename(`./templates/views/online_bills/Photo_online_bill_${verifypayment['CODE']}.jpeg`, `./templates/views/online_bills/Photo_online_bill_${verifypayment['CODE']}_done.jpeg`, function (err) {
					if (err) {
						consolr.log(err)
						fs.rename(`./templates/views/online_bills/Photo_online_bill_${verifypayment['CODE']}.jpg`, `./templates/views/online_bills/Photo_online_bill_${verifypayment['CODE']}_done.jpg`, function (err) {
							if (err) console.log('ERROR: ' + err);
						});
					};
				});

				//////////////////////

				const data = await user.find({ NUMBER: verifyUser.NUMBER });
				console.log(data);



				const Email = data[0]['EMAIL'];


				//EMAIL----------------
				var mailoptions = {
					from: process.env.EMAIL,
					to: Email,
					subject: 'Successful Payment',
					html: `<h2> Hi ${data[0]['NAME']}, Thank you for your payment.</h2><br /><p>We accept your payment.Your payment is successful for verifypayment['CODE'].</p>`
				};

				transporter.sendMail(mailoptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log(info.response);
					}
				});

				//MSG-----------------------

				const from = process.env.NUMBER;
				const to = data[0]['NUMBER'];
				const text = `Successful Payment.... Hi ${data[0]['NAME']}, Thank you for your payment.We accept your payment.Your payment is successful for verifypayment['CODE']..`;

				vonage.message.sendSms(from, to, text, (err, responseData) => {
					if (err) {
						console.log(err);
					} else {
						if (responseData.messages[0]['status'] === "0") {
							console.log("Message sent successfully.");
						} else {
							console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
						}
					}
				})


				const None = "";
				const login_status = "LOGOUT";
				const logout_link = "/logout";

				return res.status(201).render("success", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
			} else {
				const Msg = "Payment unsuccessfull";
				return res.status(500).render("error", { MSG: Msg });
			}
		})
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(500).render("error", { MSG: Msg });
	}
})

app.get('/pay_your_membership_payment', async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);


		const login_status = "LOGOUT";
		const logout_link = "/logout";
		const None = "none";
		return res.status(201).render("online_payment_membership", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/pay")
	}
})

app.post('/pay_your_membership_payment', async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);
		console.log(req.body.Mobile_number);
		const Mobile_number = req.body.Mobile_number;
		const data = await user.find({ NUMBER: verifyUser.NUMBER });
		console.log(data[0]["PAYMENT_DONE"]);

		if (data[0]["PAYMENT_DONE"] == 0) {

			const token_payment_membership = await jwt.sign({ NUMBER: Mobile_number }, process.env.SERECTKEY_ONLINE_PAYMENT_MEMBERSHIP);
			console.log(token_payment_membership);

			res.cookie("token_payment_membership", token_payment_membership, {
				expires: new Date(253402300000000),
				httpOnly: true
			});


			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("paynow_online_membership", { LOGIN: login_status, Logout_link: logout_link, NONE: none });
		} else {
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			const None = "";
			return res.status(201).render("online_payment_membership", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		}
	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/payment")
	}
})

app.post('/online_paying_membership', async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);

		let options = {
			amount: 499 * 100,
			currency: "INR",
		}

		razorpay.orders.create(options, (err, order) => {
			console.log(order);
			res.json(order);
		})
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render("error", { MSG: Msg });
	}
})


app.post('/pay_done_online_payment_membership",', async (req, res) => {
	try {
		const token_pay = req.cookies.jwt_pay;
		const verifyUser = jwt.verify(token_pay, process.env.SERECTKEY_PAY);
		console.log(verifyUser);
		const token_payment_membership = req.cookies.token_payment_membership;
		const varify_token_payment_membership = jwt.verify(token_payment_membership, process.env.SERECTKEY_ONLINE_PAYMENT_MEMBERSHIP);
		console.log(varify_token_payment_membership);

		console.log(varify_token_payment_membership["NUMBER"]);
		//CHANGE THE BILL IMG NAME WITH DONE//

		razorpay.payments.fetch(req.body.razorpay_payment_id).then(async (paymentDocument) => {

			if (paymentDocument.status == "captured") {

				const TODAY_DATE = new Date();
				const DAY = TODAY_DATE.getDate();
				console.log(DAY);
				const MONTH = TODAY_DATE.getMonth() + 1;
				console.log(MONTH);
				const YEAR = TODAY_DATE.getFullYear();
				console.log(YEAR);


				const update = await user.update({ NUMBER: varify_token_payment_membership["NUMBER"] }, { $set: { PAYMENT_DONE: 1, DAY: DAY, MONTH: MONTH, YEAR: YEAR } });


				const data = await user.find({ NUMBER: verifyUser.NUMBER });
				console.log(data);



				const Email = data[0]['EMAIL'];

				var NewDate = Date.today().add(30).days();
				const EXWDAY = NewDate.getDate();
				console.log(DAY);
				const EXMONTH = NewDate.getMonth() + 1;
				console.log(MONTH);
				const EXYEAR = NewDate.getFullYear();
				console.log(YEAR);

				//EMAIL-----------------

				var mailoptions = {
					from: process.env.EMAIL,
					to: Email,
					subject: 'Successful Payment',
					html: `<h2> Hi ${data[0]['NAME']}, Thank you for your payment.</h2><br /><p>We accept your payment for membership valid for ${EXDAY}/${EXMONTH}/${EXYEAR}. Your payment is successful.</p>`
				};

				transporter.sendMail(mailoptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log(info.response);
					}
				});

				//MSG---------------------

				const from = process.env.NUMBER;
				const to = data[0]['NUMBER'];
				const text = `Successful Payment.... Hi ${data[0]['NAME']}, Thank you for your payment. We accept your payment for membership valid for ${DAY}/${MONTH}/${YEAR}. Your payment is successful.`;

				vonage.message.sendSms(from, to, text, (err, responseData) => {
					if (err) {
						console.log(err);
					} else {
						if (responseData.messages[0]['status'] === "0") {
							console.log("Message sent successfully.");
						} else {
							console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
						}
					}
				})


				const login_status = "LOGOUT";
				const logout_link = "/logout";
				const None = "none";
				return res.status(201).render("success", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
			} else {
				const Msg = "Payment unsuccessfull";
				return res.status(400).render("error", { MSG: Msg });
			}
		})
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render("error", { MSG: Msg });
	}
})

app.post('/hire_professional', async (req, res) => {
	try {
		const Name = req.body.Name;
		const Number = req.body.Number;
		const Email = req.body.Email;
		const Pincode = req.body.Pincode;
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data_user = await user.find({ NUMBER: verifyUser.NUMBER });
		const data_professional = await user.find({ NUMBER: Number });

		const data = await find.find({ NUMBER: verifyUser.NUMBER }).sort({ $natural: -1 }).limit(1);

		const update = await find.update({ TODAY_DATE: data[0]['TODAY_DATE'] }, { $set: { CONNECTED: [{ NAME: Name, NUMBER: Number, EMAIL: Email, PINCODE: Pincode }] }, CONNECTED_NUMBER: Number });


		console.log(Name);
		console.log(Number);
		console.log(Email);
		console.log(Pincode);
		console.log(data_professional[0]['PROFESSION']);
		console.log(data_user[0]['ACCOUNT_TYPE']);
		console.log(data_user[0]['BLOCK']);


		if (data_user[0]['ACCOUNT_TYPE'] == "User" && data_user[0]['BLOCK'] == 0) {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("hire_now", { LOGIN: login_status, Logout_link: logout_link, NONE: None, PROFESSION: data_professional[0]['PROFESSION'] });
		} else if (data_user[0]['ACCOUNT_TYPE'] == "Professional" && data_user[0]['BLOCK'] == 0) {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("hire_now", { LOGIN: login_status, Logout_link: logout_link, NONE: None, PROFESSION: data_professional[0]['PROFESSION'] });
		} else {
			return res.status(500).redirect("/");
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render("error", { MSG: Msg });
	}
})

app.post('/reviews', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const Number = req.body.Number;

		const data_user = await user.find({ NUMBER: verifyUser.NUMBER });
		const data = await review.find({ PROFESSIONAL_NUMBER: Number });
		const otos = JSON.stringify(data);

		if (data_user[0]['ACCOUNT_TYPE'] == "User" && data_user[0]['BLOCK'] == 0) {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(200).render("reviews", { NUMBER: Number, RELATED_REVIEWS: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else if (data_user[0]['ACCOUNT_TYPE'] == "Professional" && data_user[0]['BLOCK'] == 0) {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(200).render("reviews", { NUMBER: Number, RELATED_REVIEWS: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else {
			return res.status(400).redirect("/");
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render("error", { MSG: Msg });
	}
})


app.post('/hired', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const Text = req.body.Text;
		const Latitude = req.body.Latitude;
		const Longitude = req.body.Longitude;
		const SEC = Date.now();
		console.log(Latitude);
		console.log(Longitude);

		const data = await find.find({ NUMBER: verifyUser.NUMBER }).sort({ $natural: -1 }).limit(1);

		const update = await find.update({ NUMBER: verifyUser.NUMBER, TODAY_DATE: data[0]['TODAY_DATE'] }, { $set: { HIRED: 1, TEXT: Text, LATITUDE: Latitude, LONGITUDE: Longitude, CODE: SEC } });

		console.log(data[0]["CONNECTED_NUMBER"]);

		const data_professional = await user.find({ NUMBER: data[0]["CONNECTED_NUMBER"] });

		if (data_professional[0]['ACTIVE'] == 1) {
			const update_active = await user.update({ NUMBER: data[0]['CONNECTED_NUMBER'] }, { $set: { ACTIVE: 0 } });
			return res.status(201).redirect("/hired");
		} else {
			const Msg = "Your Desirable person is already hired";
			return res.status(400).render("error", { MSG: Msg });
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render("error", { MSG: Msg });
	}
})


app.get('/hired', async (req, res) => {
	try {

		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);

		const data = await find.find({ NUMBER: verifyUser.NUMBER }).sort({ $natural: -1 }).limit(1);
		console.log(data);
		const data_user = await user.find({ NUMBER: verifyUser.NUMBER });
		console.log(data_user);
		const data_professional = await user.find({ NUMBER: data[0]['CONNECTED'][0]['NUMBER'] });
		console.log(data_professional);


		const Email = data_user[0]['EMAIL'];

		console.log("--------------------------");
		console.log(Email);
		console.log("--------------------------");

		//EMAIL----------------

		var mailoptions = {
			from: process.env.EMAIL,
			to: Email,
			subject: 'Thank You For Hiring Our Professional',
			html: `<h2> Hi ${data[0]['NAME']}, Thank you for hiring our professional.</h2><br /><p>Our professional is on the way plz try to be calm.<p/><br /><br /><p>if any issue contact us 1803437652  and tell us about your Problem.</p><br /><p><b>Your varification code with professional : </b>${data[0]['CODE']}</p><p>Please make sure to check your verification code with your professional.</p><p>To give the success rate to the hired the professional click here localhost:5000/success_rate?AN=data_professional[0]['ADHARCARD_NUMBER']</p>`
		};

		transporter.sendMail(mailoptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		});



		//MSG------------------

		var from = process.env.NUMBER;
		var to = data[0]['NUMBER'];
		var text = `Thank You For Hiring Our Professional..., Hi ${data[0]['NAME']}, Thank you for hiring our professional.Our professional is on the way plz try to be calm. if any issu please contact us 1803437652 and tell us about your Problem.Your varification code with professional : ${data[0]['CODE']}. Please make sure to check your verification code with your professional.To give the success rate to the hired the professional click here localhost:5000/success_rate?AN=data_professional[0]['ADHARCARD_NUMBER']`;

		vonage.message.sendSms(from, to, text, (err, responseData) => {
			if (err) {
				console.log(err);
			} else {
				if (responseData.messages[0]['status'] === "0") {
					console.log("Message sent successfully.");
				} else {
					console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
				}
			}
		})


		//EMAIL-----------------


		const Email_professional = data[0]['CONNECTED'][0]['EMAIL'];
		console.log(Email_professional);

		console.log(data[0]["LATITUDE"]);
		console.log(data[0]["LONGITUDE"]);

		var mailoptions = {
			from: process.env.EMAIL,
			to: Email_professional,
			subject: 'Attention You Are Hired',
			html: `<h2> Hi ${data[0]['CONNECTED'][0]['NAME']},You are hired.</h2><br /><p><b>Customer Name : </b>${data_user[0]['NAME']}<p/><br /><p><b>Customer Contact Number : </b>${data_user[0]['NUMBER']}<p/><br /><p><b>Customer Contact Email : </b>${data_user[0]['EMAIL']}.<p/><br /><p>You are inform that contact the customer as fast as possible...</p><br /><p><b>Customr's problem : </b>${data[0]['TEXT']}</p><br /><p><b>Your varification code with Customer  & your payment code : </b>${data[0]['CODE']}</p><br /><p>Location of user : <a href="https://www.google.com/maps/search/?api=1&query=${data[0]["LATITUDE"]},${data[0]["LONGITUDE"]}" click here to show location</p><br > <p>Copy and peast the link in browser : https://www.google.com/maps/search/?api=1&query=${data[0]["LATITUDE"]},${data[0]["LONGITUDE"]} </p>`,
		};

		transporter.sendMail(mailoptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		});


		//MSG------------------

		from = process.env.NUMBER;
		to = data[0]['CONNECTED'][0]['NUMBER'];
		text = `Attention You Are Hired..., Hi ${data[0]['CONNECTED'][0]['NAME']},Customer Name : ${data_user[0]['NAME']}. Customer Contact Number : ${data_user[0]['NUMBER']}. Customer Contact Email : ${data_user[0]['EMAIL']}. You are inform that contact the customer as fast as possible. Customrs problem : ${data[0]['TEXT']}. Your varification code with Customer & your payment code : ${data[0]['CODE']}. Location of user : https://www.google.com/maps/search/?api=1&query=${data[0]["LATITUDE"]},${data[0]["LONGITUDE"]} .`;

		vonage.message.sendSms(from, to, text, (err, responseData) => {
			if (err) {
				console.log(err);
			} else {
				if (responseData.messages[0]['status'] === "0") {
					console.log("Message sent successfully.");
				} else {
					console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
				}
			}
		})


		return res.status(201).redirect("/");
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render("error", { MSG: Msg });
	}
})


app.get('/success_rate', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);

		const An = req.query.AN;
		console.log(An);

		return res.status(201).render("success_rate", { AN: An });

	} catch (e) {
		console.log(e);
		return res.status(400).redirect("/login_form");
	}
})

app.post('/success_rate', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data_user = await user.find({ NUMBER: verifyUser.NUMBER });
		console.log(data_user);

		const An = req.body.AN;
		console.log(An);
		const New_rate = req.body.rating;
		console.log(New_rate);
		const Review = req.body.Review;

		const data = await user.find({ ADHARCARD_NUMBER: An });
		console.log(data[0]["SUCCESS_RATE_LEFT"]);
		console.log(data[0]["SUCCESS_RATE_RIGHT"]);

		const Old_rate1 = `${data[0]["SUCCESS_RATE_LEFT"]}.${data[0]["SUCCESS_RATE_RIGHT"]}`;
		const Olo_rate = parseFloat(Old_rate1);
		const Rate1 = (Olo_rate * 100) + (New_rate * 100);
		console.log(Rate1);
		const Rate2 = Rate1 / 200;
		console.log(Rate2);
		const Rate_left = parseInt(Rate2);
		const Rate_right = parseInt((Rate2 % 1).toFixed(1).substring(2));
		console.log(Rate_left);
		console.log(Rate_right);
		const Total_rattings = parseInt(data[0]["TOTAL_RATTINGS"]) + 1;
		console.log("---------------------------");
		console.log(Total_rattings);
		console.log("--------------------");
		const update = await user.update({ ADHARCARD_NUMBER: An }, { $set: { SUCCESS_RATE_LEFT: Rate_left, SUCCESS_RATE_RIGHT: Rate_right, TOTAL_RATTINGS: Total_rattings } });

		const reviews = new review({
			PROFESSIONAL_NUMBER: data[0]["NUMBER"],
			USER_NAME: data_user[0]["NAME"],
			RATE: New_rate,
			TEXT: Review
		});

		const result = await reviews.save();


		return res.status(201).redirect("/");

	} catch (e) {
		console.log(e);
		return res.status(200).redirect("/login_form");
	}
})


app.get('/userid', async (req, res) => {
	try {
		console.log(req.cookies.jwt);
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ _id: verifyUser._id });
		console.log(data);
		if (verifyUser.NUMBER === data[0]['NUMBER'] && data[0]['ACCOUNT_TYPE'] == "Professional") {

			const login_status = "LOGOUT";
			const logout_link = "/logout"

			return res.status(201).render("userid", { LOGIN: login_status, Logout_link: logout_link, AGE: data[0]['AGE'], GENDER: data[0]['GENDER'], NAME: data[0]['NAME'], EXPERIENCE: data[0]['EXPERIENCE'], STATE: data[0]['STATE'], COUNTRY: data[0]['COUNTRY'], DESCRIPTION: data[0]['DESCRIPTION'], Photo_link: data[0]['PHOTO'], PINCODE: data[0]['PINCODE'] });

		} else {
			return res.status(500).redirect("/");
		}
	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/login_form");
	}
})



app.get('/edit_profile', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);

		const login_status = "LOGOUT";
		const logout_link = "/logout";

		const data = await user.find({ _id: verifyUser._id });
		console.log(data);
		if (verifyUser.NUMBER === data[0]['NUMBER'] && data[0]['ACCOUNT_TYPE'] == "Professional" && data[0]['BLOCK'] == 0) {

			return res.status(201).render("edit_profile", { LOGIN: login_status, Logout_link: logout_link })
		} else {
			return res.status(500).redirect("/");
		}
	} catch (e) {
		console.log(e);
		return res.status(500).redirect("/login_form");
	}
})


app.post('/userid', imageUpload.fields([{
	name: 'Photo', maxCount: 1
}, {
	name: 'Photo1', maxCount: 1
}, {
	name: 'Photo2', maxCount: 1
}, {
	name: 'Photo3', maxCount: 1
}]), async (req, res) => {
	try {
		const Pincode = req.body.Pincode;
		const State = req.body.State;
		const Country = req.body.Country;
		const Description = req.body.Description;
		const Photo = req.body.Photo;
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ _id: verifyUser._id });
		const update = await user.update({ _id: verifyUser._id }, { $set: { STATE: State, COUNTRY: Country, DESCRIPTION: Description, PINCODE: Pincode } });

		console.log(data);
		if (verifyUser.NUMBER === data[0]['NUMBER'] && data[0]['BLOCK'] == 0) {
			return res.status(201).redirect("userid");
		} else {
			return res.status(500).redirect("/");
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.get('/privacy_policy', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ _id: verifyUser._id });

		if (data[0]['ACCOUNT_TYPE'] === "User") {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("privacy_policy", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("privacy_policy", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		}
	} catch (e) {
		console.log(e);
		const login_status = "LOGIN";
		const logout_link = "/login_form";
		const None = "none";
		return res.status(200).render("privacy_policy", { LOGIN: login_status, Logout_link: logout_link, NONE: None })
	}
})

app.get('/terms', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ _id: verifyUser._id });

		if (data[0]['ACCOUNT_TYPE'] === "User") {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("terms_conditions", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("terms_conditions", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		}
	} catch (e) {
		console.log(e);
		const login_status = "LOGIN";
		const logout_link = "/login_form";
		const None = "none";
		return res.status(200).render("terms_conditions", { LOGIN: login_status, Logout_link: logout_link, NONE: None })
	}
})

app.get('/aboutus', async (req, res) => {

	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ _id: verifyUser._id });

		if (data[0]['ACCOUNT_TYPE'] === "User" && data[0]['BLOCK'] == 0) {
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("aboutus", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else {
			const None = "";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render("aboutus", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
		}
	} catch (e) {
		console.log(e);
		const login_status = "LOGIN";
		const logout_link = "/login_form";
		const None = "none";
		return res.status(200).render("aboutus", { LOGIN: login_status, Logout_link: logout_link, NONE: None })
	}
})



app.get('/verification_account', (req, res) => {
	return res.status(201).render("verification_account");
})


app.post('/verification_account', async (req, res) => {
	try {
		const Adharcard_number = req.body.Adharcard_number;
		const Mobile_number = req.body.Mobile_number;
		const Password = req.body.Password;

		const data = await user.find({ NUMBER: Mobile_number });


		const Match_password = await bcryptjs.compare(Password, data[0]['PASSWORD']);
		console.log(Match_password);

		if (Match_password) {
			const update = await user.update({ NUMBER: Mobile_number }, { $set: { ADHARCARD_NUMBER: Adharcard_number, ACTIVE: 1, VARIFICATION_REQUEST: 1 } });
			return res.status(201).redirect('/');
		} else {
			const not_hidden = "";
			return res.status(400).render("verification_account", { hidden: not_hidden });
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.get('/login_form', (req, res) => {
	const None = "none";
	return res.status(201).render("login_form", { NONE: None })
})


app.get('/home', async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);
		const data = await user.find({ NUMBER: verifyUser.NUMBER });

		if (verifyUser.NUMBER === data[0]['NUMBER'] && data[0]['BLOCK'] == 0) {
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			console.log(data[0]['ACTIVE'])
			console.log(data[0]['ACCOUNT_TYPE']);
			console.log(data[0]['BLOCK'] == 0);
			if (data[0]['ACTIVE'] === 1 && data[0]['ACCOUNT_TYPE'] === "Professional" && data[0]['BLOCK'] == 0) {
				const None = "";
				const Active_hidden = "";
				const Active = "/deactive";
				const Activation_status = "Your account is on activated mode make deactivated by clicking the deactivate button";
				const Activation_button = "DEACTIVATE THE ACCOUNT";
				return res.status(201).render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden, ACTIVATION_STATUS: Activation_status, ACTIVATION_BUTTON: Activation_button, ACTIVE: Active });
			} else if (data[0]['ACTIVE'] === 0 && data[0]['ACCOUNT_TYPE'] === "Professional" && data[0]['BLOCK'] == 0) {
				const None = "";
				const Active_hidden = "";
				const Active = "/active";
				const Activation_status = "Your account is on deactivated mode make activated by clicking the activate button";
				const Activation_button = "ACTIVATE THE ACCOUNT";
				return res.status(201).render("data", { LOGIN: login_status, Logout_link: logout_link, ACTIVE: Active, ACTIVATION_STATUS: Activation_status, ACTIVATION_BUTTON: Activation_button, NONE: None, ACTIVE_HIDDEN: Active_hidden });
			} else {
				const None = "none";
				const Active_hidden = "hidden";
				return res.status(201).render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden });
			}
		} else {
			const None = "none";
			const login_status = "LOGIN";
			const logout_link = "/login_form";
			const Active_hidden = "hidden";
			return res.status(201).render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden });
		}
	} catch (e) {
		console.log(e);
		const None = "none";
		const login_status = "LOGIN";;
		const logout_link = "/login_form"
		const Active_hidden = "hidden";
		return res.status(200).render("data", { LOGIN: login_status, Logout_link: logout_link, NONE: None, ACTIVE_HIDDEN: Active_hidden });
	}
})

app.post('/home', async (req, res) => {
	try {
		const Mobile_number = req.body.Mobile_number;
		const Password = req.body.Password;
		const Latitude = req.body.Latitude;
		const Longitude = req.body.Longitude;


		const data = await user.find({ NUMBER: Mobile_number });

		console.log(data);

		const token = await jwt.sign({ _id: data[0]['_id'], NUMBER: data[0]['NUMBER'] }, process.env.SERECTKEY_LOGIN);
		console.log(token);

		const update = await user.update({ NUMBER: Mobile_number }, { $set: { TOKENS: [{ tokens: token }], LAST_LOCATION_LATITUDE: Latitude, LAST_LOCATION_LONGITUDE: Longitude } });

		console.log(data);

		const Match_password = await bcryptjs.compare(Password, data[0]['PASSWORD']);
		console.log(Match_password);

		if (Match_password) {
			res.cookie("jwt", token, {
				expires: new Date(253402300000000),
				httpOnly: true
			});
			return res.status(201).redirect('/home');
		} else {
			const None = "";
			return res.status(500).render('login_form', { NONE: None });
		}
	} catch (e) {
		console.log(e);
		const None = "";
		return res.status(500).render('login_form', { NONE: None });
		res.end();
	}
})

app.get('/createaccount', (req, res) => {
	const METHOD = req.query.METHOD;
	console.log(METHOD);
	if (METHOD == 0) {
		const None = "none";
		const NONE_NUMBER = "None";
		return res.status(201).render("createaccount_user", { NONE: None, NONE_NUMBER: None });
	} else {
		const None = "none";
		const NONE_NUMBER = "None";
		return res.status(200).render("createaccount_professional", { NONE: None, NONE_NUMBER: None });
	}
})

app.post('/otp_varification', async (req, res) => {
	try {
		const Name = req.body.Name;
		const Mobile_number = req.body.Mobile_number;
		const Email = req.body.Email;
		const Gender = req.body.Gender;
		const Age = req.body.Age;
		const Create_password = req.body.Create_password;
		const Conform_password = req.body.Conform_password;
		const Otp = Math.floor((Math.random() * 1000000) + 1);
		console.log(Otp);
		const Otp_string = Otp.toString();
		const bcryptjs_otp = await bcryptjs.hash(Otp_string, 10);
		console.log(bcryptjs_otp);
		const OTP = bcryptjs_otp;
		console.log(OTP);
		const METHOD = req.query.METHOD;
		console.log(METHOD);

		if (METHOD == 0) {
			if (Create_password === Conform_password) {
				const token_OTP = await jwt.sign({ NAME: Name, MOBILE_NUMBER: Mobile_number, EMAIL: Email, GENDER: Gender, AGE: Age, CREATE_PASSWORD: Create_password, OTP: OTP }, process.env.SERECTKEY_OTP);
				console.log(token_OTP);

				res.cookie("jwt_OTP", token_OTP, {
					expires: new Date(253402300000000),
					httpOnly: true
				});

				var mailoptions = {
					from: process.env.EMAIL,
					to: Email,
					subject: 'OTP Verification',
					html: `<h2> Hi ${Name}, Welcome to our website.</h2><p>Your Otp verification code is : ${Otp} .</p>`
				};

				transporter.sendMail(mailoptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log(info.response);
					}
				});



				console.log(Mobile_number);


				const from = process.env.NUMBER;
				const to = `${Mobile_number}`;
				const text = `Hi ${Name}, Welcome to our website.Your Otp verification code is : ${Otp} .`;

				vonage.message.sendSms(from, to, text, (err, responseData) => {
					if (err) {
						console.log(err);
					} else {
						if (responseData.messages[0]['status'] === "0") {
							console.log("Message sent successfully.");
						} else {
							console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
						}
					}
				})


				const None = "none";
				return res.status(201).render("otp_varification", { NONE: None });
			}
			else {
				const None = "";
				return res.status(400).render("createaccount_user", { NONE: None });
			}
		} else {
			const Account_type = req.body.Account_type;
			const Profession = req.body.Profession;
			const Experience = req.body.Experience;
			console.log(Experience);
			console.log(Profession);
			if (Create_password === Conform_password) {

				const token_OTP = await jwt.sign({ NAME: Name, MOBILE_NUMBER: Mobile_number, EMAIL: Email, GENDER: Gender, AGE: Age, CREATE_PASSWORD: Create_password, OTP: OTP, ACCOUNT_TYPE: Account_type, PROFESSION: Profession, EXPERIENCE: Experience }, process.env.SERECTKEY_OTP);
				console.log(token_OTP);

				res.cookie("jwt_OTP", token_OTP, {
					expires: new Date(253402300000000),
					httpOnly: true
				});

				var mailoptions = {
					from: process.env.EMAIL,
					to: Email,
					subject: 'OTP Verification',
					html: `<h2> Hi ${Name}, Welcome to our website.</h2><p>Your Otp verification code is : ${Otp} .</p>`
				};

				transporter.sendMail(mailoptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log(info.response);
					}
				});


				console.log(Mobile_number);

				const from = process.env.NUMBER;
				const to = `${Mobile_number}`;
				const text = `Hi ${Name}, Welcome to our website.Your Otp verification code is : ${Otp} .`;

				vonage.message.sendSms(from, to, text, (err, responseData) => {
					if (err) {
						console.log(err);
					} else {
						if (responseData.messages[0]['status'] === "0") {
							console.log("Message sent successfully.");
						} else {
							console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
						}
					}
				})

				const None = "none";
				return res.status(201).render("otp_varification", { NONE: None });
			} else {
				const None = "";
				return res.status(400).render("createaccount_professional", { NONE: None });
			}
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.post("/created", async (req, res) => {
	try {
		const token = req.cookies.jwt_OTP;
		const verifyUser_otp = jwt.verify(token, process.env.SERECTKEY_OTP);
		console.log(verifyUser_otp);

		const Name = verifyUser_otp.NAME;
		const Mobile_number = verifyUser_otp.MOBILE_NUMBER;
		const Email = verifyUser_otp.EMAIL;
		const Account_type = verifyUser_otp.ACCOUNT_TYPE;
		const Gender = verifyUser_otp.GENDER;
		const Age = verifyUser_otp.AGE;
		const Create_password = verifyUser_otp.CREATE_PASSWORD;
		const Otp = req.body.Otp;
		const Otp_string = Otp.toString();
		const OTP = verifyUser_otp.OTP;


		const bcryptjs_password = await bcryptjs.hash(Create_password, 10);
		console.log(bcryptjs_password);

		const bcryptjs_Otp = await bcryptjs.hash(Otp, 10);
		console.log(bcryptjs_Otp);


		const Match_otp = await bcryptjs.compare(Otp_string, OTP);
		console.log(Match_otp);

		if (Match_otp) {

			if (Account_type === "Professional") {

				try {
					//MSG------------------
					console.log(Mobile_number);
					const from = process.env.NUMBER;
					const to = `${Mobile_number}`;
					const text = `Activate Your Acount..., Hi ${Name}, Welcome to our website. To activate your account click the link https://www.quick-allservices.com/verification_account and provide your services with our users and make sure that you have to pay your joining fees for activate your services. Thank you...`;

					vonage.message.sendSms(from, to, text, (err, responseData) => {
						if (err) {
							console.log(err);
						} else {
							if (responseData.messages[0]['status'] === "0") {
								console.log("Message sent successfully.");
							} else {
								console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
							}
						}
					})


					//EMAIL------------

					var mailoptions = {
						from: process.env.EMAIL,
						to: Email,
						subject: 'Activate Your Acount',
						html: `<h2> Hi ${Name}, Welcome to our website.</h2><p>To activate your account <a href="http://localhost:5000/verification_account" >click here local </a> <br /><a href="https://www.quick-services.com/verification_account" >click here real </a> and provide your services with our users...</p><p>Thank you...</p>`
					};

					transporter.sendMail(mailoptions, (err, info) => {
						if (err) {
							console.log(err);
						} else {
							console.log(info.response);
						}
					});


					const Profession = verifyUser_otp.PPROFESSION;
					const Experience = verifyUser_otp.EXPERIENCE;
					console.log(Profession);

					const users = new user({
						NAME: Name,
						NUMBER: Mobile_number,
						EMAIL: Email,
						ACCOUNT_TYPE: Account_type,
						PROFESSION: Profession,
						EXPERIENCE: Experience,
						GENDER: Gender,
						AGE: Age,
						PASSWORD: bcryptjs_password,
					});

					const result = await users.save();
					console.log(result);
					return res.status(201).redirect("/login_form");
				} catch (e) {
					console.log(e);
					const Msg = "There are some error : Number should be unique or valid email...";
					return res.status(400).render('error', { MSG: Msg });
				}
			} else {

				try {


					//MSG--------------

					const from = process.env.NUMBER;
					const to = `${Mobile_number}`;
					const text = `Welcome To Our Website..., Hi ${Name}, Welcome to our website.You can now start hiring our professional and be sure that you have to pay hire rent per one hire. Thank you...`;

					vonage.message.sendSms(from, to, text, (err, responseData) => {
						if (err) {
							console.log(err);
						} else {
							if (responseData.messages[0]['status'] === "0") {
								console.log("Message sent successfully.");
							} else {
								console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
							}
						}
					})


					//EMAIL-------------

					var mailoptions = {
						from: process.env.EMAIL,
						to: Email,
						subject: 'Welcome To Our Website',
						html: `<h2> Hi ${Name}, Welcome to our website.</h2><p>You can now start hiring our professional  and be sure that you have to pay hire rent per one hire.</p><p> Thank you...</p>`
					};

					transporter.sendMail(mailoptions, (err, info) => {
						if (err) {
							console.log(err);
						} else {
							console.log(info.response);
						}
					});

					//send email end


					const users = new user({
						NAME: Name,
						NUMBER: Mobile_number,
						EMAIL: Email,
						GENDER: Gender,
						AGE: Age,
						PASSWORD: bcryptjs_password,
					});
					const result = await users.save();
					console.log(result);
					return res.status(201).redirect("/login_form");
				} catch (e) {
					console.log(e);
					const Msg = "There are some error : Number should be unique or valid email...";
					return res.status(400).render('error', { MSG: Msg });
				}
			}

		} else {
			const None = "";
			return res.status(400).render("otp_varification", { NONE: None });
		}
	} catch (e) {
		console.log(e);
		const Msg = "There are some error : Number should be unique or valid email...";
		return res.status(400).render('error', { MSG: Msg });
	}
	res.end()
})

app.get('/resend_otp', async (req, res) => {
	try {
		const token = req.cookies.jwt_OTP;
		const verifyUser_otp = jwt.verify(token, process.env.SERECTKEY_OTP);
		console.log(verifyUser_otp);
		res.clearCookie("jwt_OTP");
		const Name = verifyUser_otp.NAME;
		const Mobile_number = verifyUser_otp.MOBILE_NUMBER;
		const Email = verifyUser_otp.EMAIL;
		const Account_type = verifyUser_otp.ACCOUNT_TYPE;
		const Gender = verifyUser_otp.GENDER;
		const Age = verifyUser_otp.AGE;
		const Create_password = verifyUser_otp.CREATE_PASSWORD;
		const Profession = verifyUser_otp.PPROFESSION;
		const Experience = verifyUser_otp.EXPERIENCE;
		const Otp = Math.floor((Math.random() * 1000000) + 1);
		const Otp_string = Otp.toString();
		const bcryptjs_otp = await bcryptjs.hash(Otp_string, 10);
		console.log(bcryptjs_otp);
		const OTP = bcryptjs_otp;
		const data = await user.find({ NUMBER: Mobile_number });

		//EMAIL-------------------

		var mailoptions = {
			from: process.env.EMAIL,
			to: Email,
			subject: 'OTP Verification',
			html: `<h2> Hi ${Name}, Welcome to our website.</h2><p>Your Otp verification code is : ${Otp} .</p>`
		};

		transporter.sendMail(mailoptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		});


		//MSG----------------------

		const from = process.env.NUMBER;
		const to = `${Mobile_number}`;
		const text = `Hi ${Name}, Welcome to our website.Your Otp verification code is : ${Otp} .`;

		vonage.message.sendSms(from, to, text, (err, responseData) => {
			if (err) {
				console.log(err);
			} else {
				if (responseData.messages[0]['status'] === "0") {
					console.log("Message sent successfully.");
				} else {
					console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
				}
			}
		})


		const token_OTP = await jwt.sign({ NAME: Name, MOBILE_NUMBER: Mobile_number, EMAIL: Email, GENDER: Gender, AGE: Age, CREATE_PASSWORD: Create_password, OTP: OTP, ACCOUNT_TYPE: Account_type, PROFESSION: Profession, EXPERIENCE: Experience }, process.env.SERECTKEY_OTP);
		console.log(token_OTP);

		res.cookie("jwt_OTP", token_OTP, {
			expires: new Date(253402300000000),
			httpOnly: true
		});
		const None = "none";
		return res.status(201).render("otp_varification", { NONE: None });
	} catch (e) {
		console.log(e);
		const Msg = "There are some error...";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.get('/logout', async (req, res) => {
	try {

		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, process.env.SERECTKEY_LOGIN);
		console.log(verifyUser);


		await find.deleteMany({ NUMBER: verifyUser.NUMBER, HIRED: 0 }, function (err) {
			if (err) console.log(err);
			console.log("Successful deletion");
		});

		res.clearCookie("jwt");
		res.clearCookie("token_payment");
		res.clearCookie("jwt_pay");
		res.clearCookie("jwt_search");
		res.clearCookie("jwt_bill");
		return res.status(201).redirect("/")
	} catch (e) {
		res.clearCookie("jwt");
		res.clearCookie("token_payment");
		res.clearCookie("jwt_pay");
		res.clearCookie("jwt_search");
		res.clearCookie("jwt_bill");
		return res.status(200).redirect("/")
	}
})

app.get('/forgot_password', async (req, res) => {
	const None = "none";
	return res.status(201).render("forgot_password", { NONE: None });
})


app.post('/forgot_password', async (req, res) => {
	try {
		const Mobile_number = req.body.Mobile_number;
		const Create_password = req.body.Create_password;
		const Confirm_password = req.body.Confirm_password;
		const Otp = Math.floor((Math.random() * 1000000) + 1);
		console.log(Otp);
		console.log(process.env.NUMBER);
		const Otp_string = Otp.toString();
		const bcryptjs_otp = await bcryptjs.hash(Otp_string, 10);
		console.log(bcryptjs_otp);

		const token_OTP = await jwt.sign({ MOBILE_NUMBER: Mobile_number, CREATE_PASSWORD: Create_password, OTP: bcryptjs_otp }, process.env.SERECTKEY_OTP);
		console.log(token_OTP);

		const data = await user.find({ NUMBER: Mobile_number });
		console.log(data);

		if (Create_password === Confirm_password) {

			//MSG---------------------
			console.log(Mobile_number);
			console.log(process.env.NUMBER);

			const from = process.env.NUMBER;
			const to = `${Mobile_number}`;
			const text = `Hi ${data[0]["NAME"]}, Your Otp verification code for forgot password is : ${Otp}`;

			vonage.message.sendSms(from, to, text, (err, responseData) => {
				if (err) {
					console.log(err);
				} else {
					if (responseData.messages[0]['status'] === "0") {
						console.log("Message sent successfully.");
					} else {
						console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
					}
				}
			})

			//EMAIL------------------

			var mailoptions = {
				from: process.env.EMAIL,
				to: data[0]["EMAIL"], subject: 'OTP Verification',
				html: `<h2> Hi ${data[0]["NAME"]}, <p>Your Otp verification code for forgot password is : ${Otp} </p>`
			};

			transporter.sendMail(mailoptions, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log(info.response);
				}
			});


			res.cookie("jwt_OTP", token_OTP, {
				expires: new Date(253402300000000),
				httpOnly: true
			});

			const None = "none";
			return res.status(201).render("update_password", { NONE: None });
		} else {
			const None = "";
			return res.status(400).render("forgot_password", { NONE: None });
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.post('/update_password', async (req, res) => {
	try {
		const token = req.cookies.jwt_OTP;
		const verifyUser_otp = jwt.verify(token, process.env.SERECTKEY_OTP);
		console.log(verifyUser_otp);

		const Mobile_number = verifyUser_otp.Mobile_number;
		const Create_password = verifyUser_otp.CREATE_PASSWORD;
		const Otp_real = verifyUser_otp.OTP;
		console.log(`Real Otp : ${Otp_real}`);
		const Otp = req.body.Otp;
		console.log(`Enterd Otp : ${Otp}`);

		const Match_otp = await bcryptjs.compare(Otp, Otp_real);
		console.log(Match_otp);

		const bcryptjs_password = await bcryptjs.hash(Create_password, 10);
		console.log(bcryptjs_password);

		if (Match_otp) {
			const data_payment_update = await find.update({ NUMBER: Mobile_number }, { $set: { PASSWORD: bcryptjs_password } });
			return res.redirect("/")
		} else {
			const None = "";
			return res.status(201).render("update_password", { NONE: None });
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.post('/forgot_resend_otp', async (req, res) => {
	try {

		const token = req.cookies.jwt_OTP;
		const verifyUser_otp = jwt.verify(token, process.env.SERECTKEY_OTP);
		console.log(verifyUser_otp);
		res.clearCookie("jwt_OTP");
		const Mobile_number = verifyUser_otp.MOBILE_NUMBER;
		const Create_password = verifyUser_otp.CREATE_PASSWORD;
		const Otp = Math.floor((Math.random() * 1000000) + 1);
		const Otp_string = Otp.toString();
		const bcryptjs_otp = await bcryptjs.hash(Otp_string, 10);
		console.log(bcryptjs_otp);
		const OTP = bcryptjs_otp;

		const data = await user.find({ NUMBER: Mobile_number });

		//EMAIL---------------------------

		var mailoptions = {
			from: process.env.EMAIL,
			to: Email,
			subject: 'OTP Verification',
			html: `<h2> Hi ${Name}, Welcome to our website.</h2><p>Your Otp verification code is : ${Otp} .</p>`
		};

		transporter.sendMail(mailoptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		});


		//MSG-------------------------------

		const from = process.env.NUMBER;
		const to = `${Mobile_number}`;
		const text = `Hi ${Name}, Welcome to our website.Your Otp verification code is : ${Otp} .`;

		vonage.message.sendSms(from, to, text, (err, responseData) => {
			if (err) {
				console.log(err);
			} else {
				if (responseData.messages[0]['status'] === "0") {
					console.log("Message sent successfully.");
				} else {
					console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
				}
			}
		})


		const token_OTP = await jwt.sign({ MOBILE_NUMBER: Mobile_number, CREATE_PASSWORD: Create_password, OTP: OTP }, process.env.SERECTKEY_OTP);
		console.log(token_OTP);

		res.cookie("jwt_OTP", token_OTP, {
			expires: new Date(253402300000000),
			httpOnly: true
		});
		const None = "none";
		return res.status(201).render("update_password", { NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.post('/feedback', async (req, res) => {
	try {
		const Name = req.body.Name;
		const Email = req.body.Email;
		const Text = req.body.Text;

		const reviews = new feedback({
			NAME: Name,
			EMAIL: Email,
			TEXT: Text
		});

		const result = await feedbacks.save();
		console.log(result);

		return res.status(201).redirect("/")
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

//search for unpaid payment


app.get('/admin', (req, res) => {
	try {
		const None = "none";
		return res.status(201).render("login_to_search_unpaid", { NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.post('/login_to_search_unpaid', async (req, res) => {

	try {
		const Mobile_number = req.body.Mobile_number;
		const Password = req.body.Password;

		console.log(Mobile_number);
		console.log(Password);
		console.log(process.env.ADMIN_NUMBER);
		console.log(process.env.ADMIN_PASSWORD);


		const data_find = await find.find({ PAYMENT_DONE: 0, HIRED: 1 });
		console.log(data_find);

		const otos = JSON.stringify(data_find);
		console.log(otos);

		const token_search = await jwt.sign({ NUMBER: Mobile_number }, process.env.SERECTKEY_SEARCH);
		console.log(token_search);

		const Match_password = await bcryptjs.compare(Password, process.env.ADMIN_PASSWORD);
		console.log(Match_password);

		if (Mobile_number == process.env.ADMIN_NUMBER && Match_password) {
			res.cookie("jwt_search", token_search, {
				expires: new Date(253402300000000),
				httpOnly: true
			});
			const None = "none";
			const login_status = "LOGOUT";
			const logout_link = "/logout";
			return res.status(201).render('search_unpaid_payment', { UNPAID_PROFESSIONAL: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
		} else {
			const None = "";
			return res.status(400).render('login_to_search_unpaid', { NONE: None });
		}
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.get('/admin_home', async (req, res) => {

	try {

		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);


		const data_find = await find.find({ PAYMENT_DONE: 0, HIRED: 1 });
		console.log(data_find);

		const otos = JSON.stringify(data_find);;
		console.log(otos);

		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render('search_unpaid_payment', { UNPAID_PROFESSIONAL: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.post('/unpaid_payment', async (req, res) => {

	try {

		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);

		const Mobile_number = req.body.Mobile_number;
		console.log(Mobile_number);


		const data_find = await find.find({ PAYMENT_DONE: 0, HIRED: 1, CONNECTED_NUMBER: Mobile_number });
		console.log(data_find);

		const otos = JSON.stringify(data_find);
		console.log(otos);
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render('search_unpaid_payment', { UNPAID_PROFESSIONAL: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

//----------pay_offline----------------

app.get('/pay_offline', (req, res) => {
	try {

		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render("pay_offline", { LOGIN: login_status, Logout_link: logout_link, NONE: None })
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.post('/pay_offline', async (req, res) => {
	try {
		const Code = req.body.Code;
		console.log(Code);

		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);

		const token_bill = await jwt.sign({ CODE: Code }, process.env.SERECTKEY_BILL);
		console.log(token_bill);


		res.cookie("jwt_bill", token_bill, {
			expires: new Date(253402300000000),
			httpOnly: true
		});
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render("upload_bill_img", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.post('/upload_bill_img', imageUpload_bill.single('Photo_bill'), async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);

		const token_bill = req.cookies.jwt_bill;
		const verifyUser = jwt.verify(token_bill, process.env.SERECTKEY_BILL);
		console.log(verifyUser);



		const Code = verifyUser.CODE;
		const data = await find.find({ CODE: Code });
		const update = await find.update({ CODE: Code }, { $set: { PAYMENT_DONE: 1 } });

		//EMAIL---------------------

		var mailoptions = {
			from: process.env.EMAIL,
			to: data[0]['CONNECTED'][0]['EMAIL'],
			subject: 'Successful Payment ',
			html: `<h2> Hi ${data[0]['CONNECTED'][0]['NAME']},</h2><br /><p>Thankyou for your payment. We accept your payment. Your payment is successfull for paymentcode ${Code}.</p>`
		};

		transporter.sendMail(mailoptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		});


		//MSG------------------------

		const from = process.env.NUMBER;
		const to = data[0]['CONNECTED'][0]['NUMBER'];
		const text = `Successful Payment..., Hi ${data[0]['CONNECTED'][0]['NAME']}, Thankyou for your payment. We accept your payment. Your payment is successfull for ${Code}.`;

		vonage.message.sendSms(from, to, text, (err, responseData) => {
			if (err) {
				console.log(err);
			} else {
				if (responseData.messages[0]['status'] === "0") {
					console.log("Message sent successfully.");
				} else {
					console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
				}
			}
		})


		return res.status(201).redirect("/admin_home");

	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.get('/varification_request', async (req, res) => {
	try {

		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);

		const data_varification_request = await user.find({ VARIFICATION_REQUEST: 1 });
		console.log(data_varification_request);

		const otos = JSON.stringify(data_varification_request);
		console.log(otos);
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render("data_varification_request", { Data_varification_request: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.get('/varify_professional', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render("varify_professional", { LOGIN: login_status, Logout_link: logout_link, NONE: None });

	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.get('/block_id', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render("block_id", { LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.post('/block_id', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);
		const Number = req.body.Number;

		const update = await user.update({ NUMBER: Number }, { $set: { BLOCK: 1 } });

		return res.status(201).redirect("/admin_home");
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})

app.post('/varify_professional', async (req, res) => {
	try {

		const Mobile_number = req.body.Number;
		console.log(Mobile_number);
		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);

		const data = await user.find({ NUMBER: Mobile_number });
		const update = await user.update({ NUMBER: Mobile_number }, { $set: { VARIFIED: 1, VARIFICATION_REQUEST: 0 } });

		//EMAIL--------------------

		var mailoptions = {
			from: process.env.EMAIL,
			to: data[0]['EMAIL'],
			subject: 'Account Verified',
			html: `<h2> Hi ${data[0]['NAME']},</h2><br /><p>Thankyou for joining our website Your account is verified successfully to activate your account you have to pay joining fees per month.<a href="https://www.quick-services.com/pay">click here real</a><a href="http://localhost:5000/pay">click here local</a> to pay your membership payment valid for one month.</p>`
		};

		transporter.sendMail(mailoptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		});


		//MSG------------------------

		const from = process.env.NUMBER;
		const to = data[0]['NUMBER'];
		const text = `Account Verified..., Hi ${data[0]['NAME']},Thankyou for joining our website Your account is verified successfully. https://www.quick-services.com/pay /  http://localhost:5000/pay to pay your membership payment valid for one month`;

		vonage.message.sendSms(from, to, text, (err, responseData) => {
			if (err) {
				console.log(err);
			} else {
				if (responseData.messages[0]['status'] === "0") {
					console.log("Message sent successfully.");
				} else {
					console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
				}
			}
		})

		return res.status(201).redirect("/admin_home");

	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}

})
//---------------search_hired----------------------



app.get('/search_hired', async (req, res) => {
	try {

		const token_search = req.cookies.jwt_search;
		const verifyUser_search = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser_search);
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render("search_hired", { LOGIN: login_status, Logout_link: logout_link, NONE: None });

	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.post('/search_hired', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser);
		const Number = req.body.Mobile_number;


		const data_find = await find.find({ NUMBER: Number, HIRED: 1 }).sort({ $natural: -1 }).limit(1);
		console.log(data_find);

		const otos = JSON.stringify(data_find);
		console.log(otos);


		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render('search_unpaid_payment', { UNPAID_PROFESSIONAL: otos, LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.get('/all_users', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser);
		const Number = req.body.Mobile_number;


		const data_professional = await user.find({ ACCOUNT_TYPE: "Professional" });
		console.log(data_professional);

		const otos_professional = JSON.stringify(data_professional);
		console.log(otos_professional);


		const data_user = await user.find({ ACCOUNT_TYPE: "User" });
		console.log(data_user)
			;

		const otos_user = JSON.stringify(data_user);
		console.log(otos_user);


		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render('all_users', { data_professional: otos_professional, data_user: otos_user, LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})



app.get('/pay_membership', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser);
		const Number = req.body.Mobile_number;


		const data_find_done = await user.find({ PAYMENT_DONE: 1, BLOCK: 0 });
		console.log(data_find_done);

		///////////////////////////////////////////
		var i = 0;
		const TODAY_DATE = new Date();
		const DAY = TODAY_DATE.getDate();
		console.log(DAY);
		const MONTH = TODAY_DATE.getMonth() + 1;
		console.log(MONTH);
		const YEAR = TODAY_DATE.getFullYear();
		console.log(YEAR);

		async function update_membership_payment(Number) {
			const update = await user.update({ NUMBER: Number }, { $set: { PAYMENT_DONE: 0 } });
			console.log(update);
		}

		data_find_done.forEach(info => {

			var date_payment = `${data_find_done[i]["YEAR"]}/${data_find_done[i]["MONTH"]}/${data_find_done[i]["DAY"]}`;
			var date1 = new Date(date_payment);

			var date_now = `${YEAR}/${MONTH}/${DAY}`;

			var date2 = new Date(date_now);

			var diffTime = Math.abs(date2 - date1);
			var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays >= 30) {

				console.log(data_find_done[i]['NUMBER']);

				update_membership_payment(data_find_done[i]['NUMBER']);

				const Email = data_find_done[i]["EMAIL"];

				var mailoptions = {
					from: process.env.EMAIL,
					to: Email,
					subject: 'Successful Payment',
					html: `<h2> Hi ${data_find_done[i]['NAME']}, Your membership payment is now expired.</h2><br /><p>Pay your menbership payment as soon as you can...</p>`
				};

				transporter.sendMail(mailoptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log(info.response);
					}
				});

				//MSG------------------------

				const from = process.env.NUMBER;
				const to = data_find_done[i]['NUMBER'];
				const text = `Hi ${data_find_done[i]['NAME']},Your membership payment is now expired.pay your menbership payment as soon as you can...`;

				vonage.message.sendSms(from, to, text, (err, responseData) => {
					if (err) {
						console.log(err);
					} else {
						if (responseData.messages[0]['status'] === "0") {
							console.log("Message sent successfully.");
						} else {
							console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
						}
					}
				})


			}
			i = i + 1;
		});

		/////////////////////////////


		const otos_done = JSON.stringify(data_find_done);
		console.log(otos_done);


		const data_find_not_done = await user.find({ PAYMENT_DONE: 0, BLOCK: 0 });
		console.log(data_find_not_done);

		const otos_not_done = JSON.stringify(data_find_not_done);
		console.log(otos_not_done);

		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render('data_pay_membership', { data_find_done: otos_done, data_find_not_done: otos_not_done, LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.get('/pay_membership_payment', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser);
		const None = "none";
		const login_status = "LOGOUT";
		const logout_link = "/logout";
		return res.status(201).render('pay_membership', { LOGIN: login_status, Logout_link: logout_link, NONE: None });
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.status(400).render('error', { MSG: Msg });
	}
})


app.post('/pay_membership', async (req, res) => {
	try {
		const token_search = req.cookies.jwt_search;
		const verifyUser = jwt.verify(token_search, process.env.SERECTKEY_SEARCH);
		console.log(verifyUser);

		const Mobile_number = req.body.Number;

		var TODAY_DATE = new Date();
		const DAY = TODAY_DATE.getDate();
		console.log(DAY);
		const MONTH = TODAY_DATE.getMonth() + 1;
		console.log(MONTH);
		const YEAR = TODAY_DATE.getFullYear();
		console.log(YEAR);

		const update = await user.update({ NUMBER: Mobile_number }, { $set: { PAYMENT_DONE: 1, DAY: DAY, MONTH: MONTH, YEAR: YEAR } });


		const data = await user.find({ NUMBER: Mobile_number });
		console.log(data);


		const Email = data[0]["EMAIL"];

		var future = new Date();
		future.setDate(future.getDate() + 30);

		const EXDAY = future.getDate();
		console.log(EXDAY);
		const EXMONTH = future.getMonth() + 1;
		console.log(MONTH);
		const EXYEAR = future.getFullYear();
		console.log(YEAR);

		console.log(future);
		//EMAIL--------------------

		var mailoptions = {
			from: process.env.EMAIL,
			to: Email,
			subject: 'Successful Payment',
			html: `<h2> Hi ${data[0]['NAME']}, Thank you for your payment.</h2><br /><p>We accept your payment for membership valid for ${EXDAY}/${EXMONTH}/${EXYEAR}. Your payment is successful.</p>`
		};

		transporter.sendMail(mailoptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		});

		//MSG------------------------

		const from = process.env.NUMBER;
		const to = data[0]['NUMBER'];
		const text = `Successful Payment.... Hi ${data[0]['NAME']}, Thank you for your payment. We accept your payment for membership valid for ${EXDAY}/${EXMONTH}/${EXYEAR}. Your payment is successful.`;

		vonage.message.sendSms(from, to, text, (err, responseData) => {
			if (err) {
				console.log(err);
			} else {
				if (responseData.messages[0]['status'] === "0") {
					console.log("Message sent successfully.");
				} else {
					console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
				}
			}
		})


		return res.status(201).redirect("/pay_membership");

	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		const Msg = "There are some error";
		return res.render('error', { MSG: Msg });
	}
})


app.get("/*", (req, res) => {
	return res.status(200).render("reviews");
});


//---------------------------------
app.listen(3000, () => {
	console.log("The server is running at the port 3000");
});
//jwt_bill
