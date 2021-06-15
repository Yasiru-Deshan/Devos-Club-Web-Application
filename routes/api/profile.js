const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const { body, validationResult } = require('express-validator');


//Load profile model
const Profile = require('../../models/Profile');

//load validation
const validateProfileInput = require('../../validation/profile');

//Load user profile
const User = require('../../models/User');
const profile = require('../../validation/profile');

//@route GET api/profile/test
//@desc test profile route
//@access public
router.get('/test',(req,res)=>res.json({
    msg: "Profile Works"
})); 


//@route GET api/profile
//@desc get current users profile
//@access public

router.get('/',passport.authenticate('jwt',{session:false}),(req,res)=>{

    const errors = {};

    Profile.findOne({ user : req.user.id})
    .populate('user',['name','avatar'])
    .then(profile=>{
        if(!profile){
            errors.noprofile='There is no profile for this user';

            return res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err=>res.status(404).json(err));
    
})


//@route POST  api/profile
//@desc create or edit profile
//@access private

router.post('/',passport.authenticate('jwt',{session:false}),
body('handle').custom((value,{req})=>{

   if(value==''){
    throw new Error('Handle is required');
   }

   return true;

}),
body('status').custom((value,{req})=>{

    if(value==''){
     throw new Error('Status is required');
    }
 
    return true;
 
 }),
 body('skills').custom((value,{req})=>{

    if(value==''){
     throw new Error('Skills are required');
    }
  
    return true;
 
 }),
/* body('website').custom((value,{req})=>{
     if(!value==''){
         if(!body('website').isURL()){
            throw new Error('Not a valid URL');
         }
     }
     else{
    
     }
 }),
 body('facebook').isURL(),
 body('linkedin').isURL(),
 body('instagram').isURL(),
 body('twitter').isURL(),*/
(req,res)=>{

   // const{errors,isValid} = validateProfileInput(req.body);
   const errors = validationResult(req);

    //check validation
    /*if(!isValid){

        //Return any errors with 400 status
        return res.status(400).json(errors);

    }*/
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }


    //get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    if(req.body.handle)profileFields.handle = req.body.handle;
    if(req.body.company)profileFields.company = req.body.company;
    if(req.body.website)profileFields.website = req.body.website;
    if(req.body.location)profileFields.location = req.body.location;
    if(req.body.bio)profileFields.bio = req.body.bio;
    if(req.body.status)profileFields.status = req.body.status;
    if(req.body.githubusername)profileFields.githubusername = req.body.githubusername;
    
    //skills-split into array
    if(typeof req.body.skills!=='undefined'){
        profileFields.skills = req.body.skills.split(',');
    }
    
    //social
    profileFields.social = {};
    if(req.body.youtube)profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter)profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook)profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin)profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram)profileFields.social.instagram = req.body.instagram;   
  

    Profile.findOne({user:req.user.id})
    .then(profile=>{

        if(profile){
            //update
            Profile.findOneAndUpdate({user:req.user.id},
                {$set: profileFields},
                {new: true}
            ).then(profile=>res.json(profile));
        }else{
            //create

            //check if handle exist
            Profile.findOne({handle : profileFields.handle}).then(profile=>{

                if(profile){
                    errors.handle = 'That handle already exist';
                    res.status(400).json(errors);
                }

            //save profile
            new Profile(profileFields).save().then(profile=>res.json(profile));

            });

        }

    });

})
  
//@route GET api/profile/handle/:handle
//@desc Get profile by handle
//@access public

router.get('/handle/:handle',(req,res)=>{
    const errors  ={};

    Profile.findOne({handle: req.params.handle})

    .populate('user',['name','avatar'])
    .then(profile=>{
        if(!profile){
            errors.noprofile = 'There is no profile ';
            res.status(404).json(errors);
        }

        res.json(profile);
    })
    .catch(err=>res.status(404).json(err)); 
});

//@route GET api/profile/user/:user_id
//@desc Get profile by handle
//@access public

router.get('/user/:user_id',(req,res)=>{
    const errors  ={};

    Profile.findOne({user: req.params.user_id})

    .populate('user',['name','avatar'])
    .then(profile=>{
        if(!profile){
            errors.noprofile = 'There is no profile ';
            res.status(404).json(errors);
        }

        res.json(profile);
    })
    .catch(err=>res.status(404).json({profile: 'There is no profile for this user'})); 
});


//@route GET api/profile/all
//@desc Get all profiles
//@access public
router.get('/all',(req,res)=>{
    const errors = {}

    Profile.find()
    .populate('user',['name','avatar'])
    .then(profiles=>{
        if(!profiles){
            errors.noprofile = 'There are no profiles';
            return res.status(404).json();
        
        }
        res.json(profiles);
    })
        .catch(err=>res.status(404).json({profile: 'There are no profiles'})); 
        
})

//@route GET api/profile/experience
//@desc add experience to profile
//@access private

router.post('/experience',passport.authenticate('jwt',{ session : false}),
body('title').custom((value,{req})=>{

    if(value==''){
     throw new Error('Job title is required');
    }
 
    return true;
 
 }),
 body('company').custom((value,{req})=>{

    if(value==''){
     throw new Error('Company field is required');
    }
 
    return true;
 
 }),
 body('from').custom((value,{req})=>{

    if(value==''){
     throw new Error('From date field is required');
    }
 
    return true;
 
 }),

(req, res)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }


    Profile.findOne({user:req.user.id})
    .then(profile=>{
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description : req.body.description

        };

        //Add expereince array
        profile.experience.unshift(newExp);

        profile.save().then(profile=>res.json(profile)) 
    })


})

//@route GET api/profile/education
//@desc add education to profile
//@access private

router.post('/education',passport.authenticate('jwt',{ session : false}),
body('school').custom((value,{req})=>{

    if(value==''){
     throw new Error('School is required');
    }
 
    return true;
 
 }),
 body('degree').custom((value,{req})=>{

    if(value==''){
     throw new Error('Degree field is required');
    }
 
    return true;
 
 }),
 body('fieldofstudy').custom((value,{req})=>{

    if(value==''){
     throw new Error('Study field is required');
    }
 
    return true;
 
 }),
 body('from').custom((value,{req})=>{

    if(value==''){
     throw new Error('From date field is required');
    }
 
    return true;
 
 }),

(req, res)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }


    Profile.findOne({user:req.user.id})
    .then(profile=>{
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description : req.body.description

        };

        //Add expereince array
        profile.education.unshift(newEdu);

        profile.save().then(profile=>res.json(profile)) 
    })


})

//@route delete api/profile/experience/:exp_id
//@desc delete expereince from profile
//@access private

router.delete('/experience/:exp_id',passport.authenticate('jwt',{ session : false}),

(req, res)=>{

    Profile.findOne({user:req.user.id})
    .then(profile=>{
        //Get Remove index
        const removeIndex = profile.experience
        .map(item=> item.id)
        .indexOf(req.params.exp_id);

        //Splice out of array
        profile.experience.splice(removeIndex, 1);

        //save
        profile.save().then(profile=>res.json(profile));
     
    })
    .catch(err=> res.status(404).json(err));


})

//@route delete api/profile/education/:edu_id
//@desc delete education from profile
//@access private

router.delete('/education/:edu_id',passport.authenticate('jwt',{ session : false}),

(req, res)=>{

    Profile.findOne({user:req.user.id})
    .then(profile=>{
        //Get Remove index
        const removeIndex = profile.education
        .map(item=> item.id)
        .indexOf(req.params.edu_id);

        //Splice out of array
        profile.education.splice(removeIndex, 1);

        //save
        profile.save().then(profile=>res.json(profile));
     
    })
    .catch(err=> res.status(404).json(err));


})

//@route delete api/profile
//@desc delete user and profile
//@access private

router.delete('/',passport.authenticate('jwt',{ session : false}),

(req, res)=>{

    Profile.findOneAndRemove({user:req.user.id})
    .then(()=>{
       User.findOneAndRemove({_id: req.user.id})
       .then(()=>
       res.json({ success: true })
       );
    })
    .catch(err=> res.status(404).json(err));


})





module.exports = router; 