const { Router } = require('express');
const router = Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.json({ title: 'User' });
});

module.exports = router;
