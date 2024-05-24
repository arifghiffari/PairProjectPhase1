'use strict';
const { readFile } = require('fs').promises
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const admins = JSON.parse(await readFile('./data/admin.json', 'utf-8')).map(async (el) => {
      el.password = await bcrypt.hash(el.password, 10)
      el.createdAt = new Date()
      el.updatedAt = new Date()

      return el
    })

    const resolvedAdmins = await Promise.all(admins)

    await queryInterface.bulkInsert('Users', resolvedAdmins, {})
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {
      truncate: true,
      restartIdentity: true
    })
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
