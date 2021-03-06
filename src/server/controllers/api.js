import Express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Post from '../models/post';
import config from '../config';

// API Route
const app = new Express();
const apiRoutes = Express.Router();
app.set('superSecret', config.secret); // secret variable
// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/login', function(req, res) {
  // find the user
  User.findOne({
    email: req.body.email
  }, (err, user) => {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // if user is found and password is right
        // create a token
        const token = jwt.sign({ email: user.email }, app.get('superSecret'), {
          expiresIn: 60 * 60 * 24 // expires in 24 hours
        });
        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token,
          userId: user._id
        });
      }   
    }
  });
});

apiRoutes.get('/setup', (req, res) => {
  // create a sample user
  const sampleUser = new User({ 
    username: 'steben', 
    email: 'hihihi', 
    password: '123456',
    admin: true 
  });

  const samplePost = new Post({
    id: '110ec58a-a0f2-4ac4-8393-c866d813b8d1',
    name: '花蓮縣立體育場', 
    description: '', 
    imagePath: 'http://i.imgur.com/NCxvVmC.png',
    steps: '',
    updatedAt: new Date()
  });

  // save the sample user
  sampleUser.save((err) => {
    if (err) throw err;
    samplePost.save((err) => {
      if (err) throw err;
      console.log('User saved successfully');
      res.json({ success: true });      
    })
  });
});

apiRoutes.get('/setup2', (req, res) => {
  // create a sample user
  const sampleUser = new User({ 
    username: 'steben', 
    email: '8888', 
    password: '12345',
    admin: true 
  });

  // save the sample user
  sampleUser.save((err) => {
    if (err) throw err;
    samplePost.save((err) => {
      if (err) throw err;
      console.log('User saved successfully');
      res.json({ success: true });      
    })
  });
});

apiRoutes.get('/posts', (req, res) => {
  Post.find({}, (err, posts) => {
    res.status(200).json(posts);
  })
});

apiRoutes.get('/posts/:id', (req, res) => {
  Post.findOne({ _id: req.params.id}, (err, posts) => {
    res.status(200).json(posts);
  })
});

// route middleware to verify a token
apiRoutes.use((req, res, next) => {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), (err, decoded) => {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});
// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/authenticate', (req, res) => {
  res.json({
    success: true,
    message: 'Enjoy your token!',
  });
});


// create post
apiRoutes.post('/posts', (req, res) => {
  const newPost = new Post({
    name: req.body.name, 
    description: req.body.description, 
    imagePath: req.body.imagePath,
    steps: "",
    updatedAt: new Date()
  });

  newPost.save((err) => {
    if (err) throw err;
    console.log('User saved successfully');
    res.json({ success: true });      
  });
}); 
// update post
apiRoutes.put('/posts/:id', (req, res) => {
  Post.update({ _id: req.params.id }, {
    name: req.body.name, 
    description: req.body.description, 
    imagePath: req.body.imagePath,
    steps: ['放入番茄', '打個蛋', '放入少許鹽巴', '用心快炒'],
    updatedAt: new Date()
  } ,(err) => {
    if (err) throw err;
    console.log('User updated successfully');
    res.json({ success: true });      
  });
});
// remove post
apiRoutes.delete('/posts/:id', (req, res) => {
  Post.remove({ _id: req.params.id }, (err, post) => {
    if (err) throw err;
    console.log('remove saved successfully');
    res.json({ success: true }); 
  });
}); 

export default apiRoutes;