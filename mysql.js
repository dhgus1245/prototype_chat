// mysql 연동
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host     : '192.168.0.75',    // 호스트 주소
    user     : 'root',           // mysql user
    password : 'cknb',       // mysql password
    port     : '3306',
    database : 'test'         // mysql 데이터베이스
});
// const pool = mysql.createPool({
//   host     : 'hiddentag.cz5fx5xtsihl.ap-southeast-1.rds.amazonaws.com',    // 호스트 주소
//   user     : 'cknb',           // mysql user
//   password : 'hiddentagDB!!10',       // mysql password
//   port     : '9306',
//   database : 'HiddenTag'         // mysql 데이터베이스
// });


const dbTest = async () => {
	try {
		const connection = await pool.getConnection(async conn => conn);
		try {
			var queryStr = "";
            queryStr += "select user_no_1, user_no_2, last_comm, update_date";
            queryStr += " from hiddentag.chat_list"
            /* Step 3. */
			const ID = 'HELLO';
			const PW = 'WORLD';
			const [rows] = await connection.query(queryStr, [ID, PW]);
			connection.release();
            return rows;
		} catch(err) {
			console.log('Query Error');
			connection.release();
			return false;
		}
	} catch(err) {
		console.log('DB Error');
		return false;
	}
};

module.exports = {
    dbTest: dbTest
};