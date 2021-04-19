var env = process.env.NODE_ENV;
var User = require('../models/User');
var jwt = require('jwt-simple');
var config = require('../config/database');
var bcrypt = require('bcrypt');

module.exports = function(app,io){
    app.post('/api/signup', makeSignUp)
    function makeSignUp(req, res){
        if(!req.body.email || !req.body.password){
            res.status(200).send({
                success:false,
                msg:'Email & Password is required'
            })
        }
        else{
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    return res.json({ success: false, msg: err.message });
                }
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) {
                        return res.json({ success: false, msg: err.message });
                    } else {
                        createUser(hash)
                    }
                });
            });
            function createUser(password){
                User.findOne({
                    email:req.body.email,
                    status: 'ACTIVE'
                })
                .exec((function(err,user){
                    if(user && user._id){
                        res.json({success:false, msg:'Email has already exist'})
                    }
                    else{
                        var obj = {
                            email: req.body.email,
                            password: password,
                            name: req.body.name || '',
                            type: 'USER',
                            status: 'ACTIVE',
                            createdDate: new Date()
                        }
                        var newUser = new User(obj)
                        newUser.save(function(err,us){
                            if(err){
                                return res.json({success:false,msg:err.message})
                            }
                            else{
                                res.json({success:true})
                            }
                        })
                    }
                }))
            }
        }
    }

    app.post('/api/login', handleLogin)
    function handleLogin(req, res){
        if(!req.body.email){
            res.status(200).send({
                success:false,
                msg:'Email is required'
            })
        }
        else{
            User.findOne({
                email:req.body.email,
                status:'ACTIVE'
            })
            .exec(function(err,user){
                if(user){
                    user.comparePassword(req.body.password, function(err, isMatch){
                        if(isMatch && !err){
                            var u = JSON.parse(JSON.stringify(user))
                            delete u.password
                            delete u._id
                            delete u.name
                            delete u.type
                            delete u.createdDate
                            delete u.__v

                            if(config.admin.includes(req.body.email)){
                                u.isAdmin = true
                            }
                            res.status(200).send({
                                success:true,
                                token:jwt.encode(u, config.secret),
                                ...u
                            })
                        }
                        else{
                            res.status(200).send({success:false, msg:'Password is incorrect'})
                        }
                    })
                }
                else{
                    res.status(200).send({success:false, msg: 'User is not found'})
                }
            })
        }
    }
}