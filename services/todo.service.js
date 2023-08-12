"use strict";

const DbMixin = require("../mixins/db.mixin");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "todo",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("todo")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"task",
			"priority",
			"status"
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			task: "string|min:3",
			// price: "number|positive"
		}
	},

	/**
	 * Action Hooks
	 */
	hooks: {
		before: {
			/**
			 * Register a before hook for the `create` action.
			 * It sets a default value for the quantity field.
			 *
			 * @param {Context} ctx
			 */
			create(ctx) {
				ctx.params.priority = "low";
                ctx.params.status = "pending";
			}
		}
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * The "moleculer-db" mixin registers the following actions:
		 *  - list
		 *  - find
		 *  - count
		 *  - create
		 *  - insert
		 *  - update
		 *  - remove
		 */

		// --- ADDITIONAL ACTIONS ---

		/**
		 * Increase the quantity of the product item.
		 */
		// increaseQuantity: {
		// 	rest: "PUT /:id/quantity/increase",
		// 	params: {
		// 		id: "string",
		// 		value: "number|integer|positive"
		// 	},
		// 	/** @param {Context} ctx */
		// 	async handler(ctx) {
		// 		const doc = await this.adapter.updateById(ctx.params.id, { $inc: { quantity: ctx.params.value } });
		// 		const json = await this.transformDocuments(ctx, ctx.params, doc);
		// 		await this.entityChanged("updated", json, ctx);

		// 		return json;
		// 	}
		// },

		/**
		 * Decrease the quantity of the product item.
		 */
		// decreaseQuantity: {
		// 	rest: "PUT /:id/quantity/decrease",
		// 	params: {
		// 		id: "string",
		// 		value: "number|integer|positive"
		// 	},
		// 	/** @param {Context} ctx  */
		// 	async handler(ctx) {
		// 		const doc = await this.adapter.updateById(ctx.params.id, { $inc: { quantity: -ctx.params.value } });
		// 		const json = await this.transformDocuments(ctx, ctx.params, doc);
		// 		await this.entityChanged("updated", json, ctx);

		// 		return json;
		// 	}
		// }
        // get pending task
        getPending:{
            rest: "GET /goal/pending",
          
            /** @param {Context} ctx  */
            async handler(ctx) {
				const doc = await this.adapter.find({status:"pending"});
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("get", json, ctx);

				return json;
			}

        },
        // add task
        addGoal:{
            rest:"POST /goal/add",
            params:{
                task:"string",
                priority:"string",
                status:"string"
            },
            /** @param {Context} ctx  */
            async handler(ctx) {
				const doc = await this.adapter.insert({task:ctx.params.task,priority:ctx.params.priority,status:ctx.params.status});
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("inserted", json, ctx);

				return json;
			}
        },
        // update task
        updateGoal : {
            rest:"PUT /:id/goal/update",
            params:{
                id:"string",
                task:"string",
                priority:"string",
                status:"string"
            },
            /** @param {Context} ctx  */
            async handler(ctx) {
				const doc = await this.adapter.updateById(ctx.params.id, { $set: { task: ctx.params.task,priority:ctx.params.priority,status:ctx.params.status } });
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("updated", json, ctx);

				return json;
			}
        },
        // delete done task
        deleteGoal:{
            rest: "DELETE /goal/delete/done",
            /** @param {Context} ctx  */
            async handler(ctx) {
				const doc = await this.adapter.removeMany({status:"done"});
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("deleted", json, ctx);

				return json;
			}
        }
        
	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Loading sample data to the collection.
		 * It is called in the DB.mixin after the database
		 * connection establishing & the collection is empty.
		 */
		async seedDB() {
			await this.adapter.insertMany([
				{ task: "Go to gym", priority: "medium", status:"pending" },
                { task: "Complete Assignment", priority: "low", status:"done" },
                { task: "Return books", priority: "high", status:"pending" },
				
			]);
		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
