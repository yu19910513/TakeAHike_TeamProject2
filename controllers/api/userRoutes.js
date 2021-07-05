const router = require('express').Router();
const { User } = require('../../models');

// GET all hike
router.get('/', async (req, res) => {
  try {
    console.log(' Try to Find All Hikes');
    const userData = await User.findAll();
    res.status(200).json(userData);
    console.log('FindAll Hike');
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET SINGLE USER
router.get('/:id', async (req, res) => {
  try {
    const userData = await User.findByPk( req.params.id, {
      // include: [{model: Trail}]
    })

    if (!userData) {
      res.status(404).json({ message: 'No User found in this id!'})
      return;
    }
    res.status(200).json(userData)
  } catch (err) {
    res.status(500).json(err)
  }

})

// CREATE A NEW USER
router.post('/', async (req, res) => {
  try {
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


// DELETE USER 
router.delete('/:id', async (req, res) => {

  try {
    const userData = await User.destroy({
      where: {
        id: req.params.id
      }
    })

    if (!userData) {
      res.status(404).json({ message: "No User found with that ID. "})
    }
    res.status(200).json(userData)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
