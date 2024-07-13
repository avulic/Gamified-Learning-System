import express from 'express';
import ModuleController from '../controllers/ModuleController';
import { authJwt } from '../middlewares/authJwt';
import { authorizeRoles } from '../middlewares/checkRole';

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Operations related to Module
 */
export default class ModuleRoute {
    public router = express.Router();

    constructor(private ModuleController: ModuleController) {
        this.setRoutes();
    }

    setRoutes() {

        /**
         * @swagger
         * /modules:
         *   post:
         *     summary: Create a new Module
         *     description: Create a new Module with the provided data.
         *     tags: [Modules]
         *     requestBody:
         *       description: Module data
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               title:
         *                 type: string
         *               description:
         *                 type: string
         *               order:
         *                 type: number
         *               contentItems:
         *                 type: array
         *                 items:
         *                   type: string
         *           example: { "title": "Module 1", "description": "Description of Module 1", "order": 1, "contentItems": ["Content1", "Content2"] }
         *     responses:
         *       201:
         *         description: Module created successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: string
         *                 title:
         *                   type: string
         *                 description:
         *                   type: string
         *             example: { "id": "1", "title": "Module 1", "description": "Description of Module 1" }
         */
        this.router.post('/modules', this.ModuleController.createModule);

        /**
         * @swagger
         * /modules:
         *   get:
         *     summary: Get all Modules
         *     description: Retrieve a list of all Modules.
         *     tags: [Modules]
         *     responses:
         *       200:
         *         description: A list of Modules
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   id:
         *                     type: string
         *                   title:
         *                     type: string
         *                   description:
         *                     type: string
         *             example: 
         *               - id: "1"
         *                 title: "Module 1"
         *                 description: "Description of Module 1"
         *               - id: "2"
         *                 title: "Module 2"
         *                 description: "Description of Module 2"
         */
        this.router.get('/modules', this.ModuleController.getAllModules);

        /**
         * @swagger
         * /modules/{id}:
         *   get:
         *     summary: Get a Module by ID
         *     description: Retrieve a Module by its ID.
         *     tags: [Modules]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Module to retrieve.
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: The requested Module
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: string
         *                 title:
         *                   type: string
         *                 description:
         *                   type: string
         *             example: { "id": "1", "title": "Module 1", "description": "Description of Module 1" }
         *       404:
         *         description: Module not found
         */
        this.router.get('/modules/:id', this.ModuleController.getModuleById);

        /**
         * @swagger
         * /modules/{id}:
         *   put:
         *     summary: Update a Module
         *     description: Update a Module with the provided data.
         *     tags: [Modules]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Module to update.
         *         schema:
         *           type: string
         *     requestBody:
         *       description: Updated Module data
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               title:
         *                 type: string
         *               description:
         *                 type: string
         *               order:
         *                 type: number
         *               contentItems:
         *                 type: array
         *                 items:
         *                   type: string
         *           example: { "title": "Updated Module", "description": "Updated description", "course": ["Course1"], "order": 2, "contentItems": ["Content1", "Content2"] }
         *     responses:
         *       200:
         *         description: Module updated successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: string
         *                 title:
         *                   type: string
         *                 description:
         *                   type: string
         *             example: { "id": "1", "title": "Updated Module", "description": "Updated description" }
         *       404:
         *         description: Module not found
         */
        this.router.put('/modules/:id', this.ModuleController.updateModule);

        /**
         * @swagger
         * /modules/{id}:
         *   delete:
         *     summary: Delete a Module
         *     description: Delete a Module by its ID.
         *     tags: [Modules]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Module to delete.
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Module deleted successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: string
         *                 title:
         *                   type: string
         *                 description:
         *                   type: string
         *             example: { "id": "1", "title": "Module 1", "description": "Description of Module 1" }
         *       404:
         *         description: Module not found
         */
        this.router.delete('/modules/:id', this.ModuleController.deleteModule);
    }
}
