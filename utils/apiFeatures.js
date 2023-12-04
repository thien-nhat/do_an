class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}
	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			console.log(sortBy);
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}
	filter() {
		const { start, end, on } = this.queryString;

		if (start && end) {
			let startDate = new Date(start);
			let endDate = new Date(end);
			endDate.setDate(endDate.getDate() + 1);
			this.query = this.query.find({
				createdAt: { $gte: startDate, $lt: endDate },
			});
		} else if (on) {
			let startDate = new Date(on);
			let endDate = new Date(on);
			endDate.setDate(endDate.getDate() + 1);
			this.query = this.query.find({
				createdAt: { $gte: startDate, $lt: endDate },
			});
		}

		return this;
	}
}
module.exports = APIFeatures;
