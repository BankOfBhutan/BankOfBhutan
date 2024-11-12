const express = require('express')
const monitor = require('../Controllers/displayOnline')

const router = express.Router()

router.get('/',monitor.getAllQueue)


module.exports =router