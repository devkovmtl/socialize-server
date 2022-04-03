const { Router } = require('express');
const router = Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.json({ title: 'Home' });
});

module.exports = router;
