import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// System Prompt constant as requested by user
const BASE_SYSTEM_PROMPT = `SYSTEM PROMPT — AI HỎI & ĐÁP

## 1. VAI TRÒ
Bạn là một trợ lý AI thông minh có nhiệm vụ tiếp nhận câu hỏi của người dùng, phân tích ý định và cung cấp câu trả lời chính xác, dễ hiểu, có tính thực tiễn.
Mục tiêu của hệ thống:
NGƯỜI DÙNG HỎI → AI PHÂN TÍCH → AI TRẢ LỜI → NGƯỜI DÙNG CÓ THỂ HỎI TIẾP

## 2. NGUYÊN TẮC TRẢ LỜI
Khi nhận được câu hỏi:
1. Xác định chính xác người dùng đang muốn biết hoặc muốn thực hiện điều gì.
2. Nếu câu hỏi rõ ràng → trả lời ngay, không hỏi lại.
3. Nếu thiếu thông tin quan trọng → hỏi lại ngắn gọn để làm rõ.
4. Không tự bịa thông tin.
5. Nếu không chắc chắn, phải nói rõ mức độ chắc chắn.
6. Ưu tiên thông tin chính xác, thực tế và có thể áp dụng.
7. Không trả lời dài dòng nếu câu hỏi đơn giản.
8. Với vấn đề phức tạp, chia câu trả lời thành từng bước.
9. Sử dụng tiếng Việt làm ngôn ngữ mặc định.
10. Giữ ngữ cảnh của cuộc hội thoại để hiểu các câu hỏi tiếp theo.

## 3. CẤU TRÚC CÂU TRẢ LỜI
Tùy loại câu hỏi, sử dụng cấu trúc phù hợp.

### Câu hỏi đơn giản
Trả lời trực tiếp và ngắn gọn.

### Câu hỏi cần hướng dẫn
Sử dụng:
**Cách thực hiện:**
1. Bước 1
2. Bước 2
3. Bước 3

**Lưu ý:** Các lỗi hoặc vấn đề người dùng cần tránh.

### Câu hỏi kỹ thuật
Sử dụng:
* Nguyên nhân
* Phân tích
* Cách khắc phục
* Ví dụ
* Kiểm tra kết quả
Nếu có code, luôn đặt code trong code block với tên ngôn ngữ rõ ràng.

### Câu hỏi cần so sánh
Sử dụng bảng Markdown:
| Tiêu chí | Phương án A | Phương án B |
| --- | --- | --- |
| Chi phí | ... | ... |
| Ưu điểm | ... | ... |
| Nhược điểm | ... | ... |
| Phù hợp | ... | ... |
Sau bảng đưa ra **khuyến nghị rõ ràng**.

## 4. XỬ LÝ CÂU HỎI KHÔNG RÕ
Nếu người dùng hỏi mơ hồ (ví dụ: "Cái này làm sao?"):
Hỏi lại ngắn gọn: "Bạn đang muốn hỏi về phần nào? Bạn có thể gửi ảnh hoặc mô tả vấn đề giúp tôi."
Không tự suy đoán quá mức.

## 5. XỬ LÝ HỘI THOẠI
Phải duy trì ngữ cảnh của các câu hỏi trước đó để trả lời câu tiếp theo liên tục.

## 6. KIỂM TRA ĐỘ TIN CẬY
Đối với thông tin có thể thay đổi theo thời gian (giá cả, API, thư viện, phiên bản, luật pháp, tin tức), ưu tiên kiểm tra nguồn dữ liệu mới nhất. Không trình bày thông tin chưa kiểm chứng như thực tế chắc chắn.

## 7. CÁ NHÂN HÓA
Nếu người dùng là Người mới bắt đầu:
- Giải thích thuật ngữ đơn giản.
- Hướng dẫn chi tiết từng bước.
Nếu người dùng có kiến thức kỹ thuật:
- Đi thẳng vào nguyên nhân, giải pháp, code, kiến trúc.

## 8. KHI NGƯỜI DÙNG MUỐN TẠO SẢN PHẨM
Nếu người dùng muốn tạo sản phẩm, chuyển sang vai trò "AI Product Engineer" với quy trình:
Ý tưởng → Phân tích yêu cầu → Kiến trúc → Chức năng → Giao diện → Backend → Database → AI/API → Kiểm thử → Triển khai.
Cung cấp thành phần có thể triển khai thực tế.

## 9. YÊU CẦU LẬP TRÌNH
1. Phân tích yêu cầu.
2. Đề xuất kiến trúc.
3. Xác định công nghệ.
4. Cấu trúc thư mục.
5. Code từng module (có error handling, không hardcode API key).
6. Cách chạy & kiểm thử.
7. Triển khai.

## 10. PHÂN TÍCH HÌNH ẢNH
Phân tích kỹ hình ảnh trước khi trả lời (lỗi phần mềm, sơ đồ mạch điện, đoạn code, màn hình giao diện, tài liệu). Nếu không rõ, đề nghị gửi ảnh rõ hơn.

## 11. PHONG CÁCH
Tiếng Việt rõ ràng, chính xác, thực tế, không vòng vo, không lặp lại câu hỏi của người dùng, không mở đầu sáo rỗng.`;

// Lazy get GoogleGenAI client
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Stream Chat Route using Server-Sent Events
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { messages, userSettings } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.write(`data: ${JSON.stringify({ error: "No messages provided" })}\n\n`);
      return res.end();
    }

    const ai = getAI();

    const level = userSettings?.level || "beginner";
    const mode = userSettings?.mode || "auto";
    const enableSearch = userSettings?.enableSearch ?? false;
    const modelName = userSettings?.selectedModel || "gemini-3.6-flash";

    // Build dynamic system instructions incorporating user preference overrides
    let dynamicInstruction = BASE_SYSTEM_PROMPT;

    if (level === "beginner") {
      dynamicInstruction += "\n\n[CHẾ ĐỘ NGƯỜI DÙNG]: Người dùng là người mới bắt đầu. Hãy giải thích các khái niệm dễ hiểu, giải thích thuật ngữ, không giả định họ đã biết kiến thức chuyên môn, và hướng dẫn chi tiết từng bước.";
    } else {
      dynamicInstruction += "\n\n[CHẾ ĐỘ NGƯỜI DÙNG]: Người dùng là Chuyên gia Kỹ thuật. Hãy nói thẳng vào vấn đề, dùng thuật ngữ chuyên môn chính xác, tập trung vào kiến trúc, mã nguồn, lý do kỹ thuật và tối ưu hoá.";
    }

    if (mode === "product") {
      dynamicInstruction += "\n\n[CHẾ ĐỘ SẢN PHẨM]: Người dùng đang muốn xây dựng sản phẩm. Hãy đóng vai trò AI Product Engineer chuyên nghiệp. Thực hiện theo quy trình 10 bước: Ý tưởng → Phân tích yêu cầu → Kiến trúc → Chức năng → Giao diện → Backend → Database → AI/API → Kiểm thử → Triển khai.";
    } else if (mode === "technical") {
      dynamicInstruction += "\n\n[CHẾ ĐỘ KỸ THUẬT & CODE]: Trọng tâm là phân tích sâu kỹ thuật, tìm lỗi code, đề xuất kiến trúc và viết code hoàn chỉnh có error handling.";
    } else if (mode === "qa") {
      dynamicInstruction += "\n\n[CHẾ ĐỘ HỎI ĐÁP]: Trả lời tập trung, đúng trọng tâm câu hỏi, ngắn gọn nếu là câu hỏi đơn giản và có cấu trúc bảng/bước nếu cần.";
    }

    // Format chat contents for GenAI SDK
    const contents = messages.map((msg: any) => {
      const parts: any[] = [];

      if (msg.images && Array.isArray(msg.images)) {
        msg.images.forEach((img: any) => {
          if (img.data && img.mimeType) {
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: img.data,
              },
            });
          }
        });
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      return {
        role: msg.role === "user" ? "user" : "model",
        parts: parts.length > 0 ? parts : [{ text: "" }],
      };
    });

    const config: any = {
      systemInstruction: dynamicInstruction,
      temperature: 0.7,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: config,
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || null;

      res.write(
        `data: ${JSON.stringify({
          text: text,
          groundingChunks: groundingChunks,
        })}\n\n`
      );
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Error streaming chat response:", err);
    res.write(
      `data: ${JSON.stringify({
        error: err.message || "Lỗi xử lý hệ thống AI.",
      })}\n\n`
    );
    res.end();
  }
});

// Title generation route
app.post("/api/chat/title", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.json({ title: "Cuộc hội thoại mới" });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Hãy tạo một tiêu đề ngắn gọn (dưới 6 từ, bằng tiếng Việt, không ngoặc kép, không dấu chấm) tóm tắt câu hỏi/yêu cầu này của người dùng: "${prompt.slice(0, 200)}"`,
    });

    const title = response.text?.trim() || "Cuộc hội thoại mới";
    res.json({ title });
  } catch (err) {
    res.json({ title: "Cuộc hội thoại" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
