const route = require("express").Router();
const { verify } = require("../utils/jwt");
const RESULT_MODEL = require("../models/result");

route.get("/list-result", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);

  if (
    user.data.role !== "SuperAdmin" &&
    user.data.role !== "Interviewer" &&
    user.data.role !== "HRM"
  ) {
    return res.json({ success: false, message: "Không được phép" });
  }

  try {
    const { page = 1, pageSize = 100 } = req.query; 

    const totalItems = await RESULT_MODEL.getCount();

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = parseInt(page);
    const itemCount = currentPage < totalPages ? parseInt(pageSize) : totalItems - parseInt(pageSize) * (totalPages - 1);

    // Lấy danh sách kết quả với phân trang
    const infoResultDb = await RESULT_MODEL.getList({page, pageSize });

    if (infoResultDb.error) {
      return res.json({ success: false, message: infoResultDb.message });
    }
    const resultsWithCounts = infoResultDb.data.map(result => {
      const trueArrCount = result.trueArr.length;
      const falseArrCount = result.falseArr.length;
    
      // Create a new object with the original result data and counts
      return {
        ...result.toObject(), // Convert Mongoose document to plain JavaScript object
        trueArrCount,
        falseArrCount,
      };
    });
    // Bao gồm thông tin phân trang trong kết quả trả về
    return res.json({
      success: true,
      data: resultsWithCounts,
      totalItems: totalItems,
      pagination: {
        totalItems,
        itemCount,
        itemsPerPage: parseInt(pageSize),
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

async function calculateCorrectIncorrectCounts(result) {
  const trueCount = result.trueArr.length;
  const falseCount = result.falseArr.length;
  return { trueCount, falseCount };
}
module.exports = route;
