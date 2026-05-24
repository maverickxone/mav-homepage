import fitz  # PyMuPDF

doc = fitz.open("test.pdf")

# 基本信息
print(f"页数: {doc.page_count}")
print(f"PDF 版本: {doc.metadata['format']}")
print(f"加密: {doc.is_encrypted}")

# 查看页面对象
page = doc[0]  # 第一页
print(f"\n第一页尺寸: {page.rect}")  # 坐标矩形
print(f"第一页旋转: {page.rotation}°")

# 提取页面内容流（原始绘图指令）
xref = page.xref  # 页面对象的 xref 编号
print(f"页面对象 xref: {xref}")

# 查看对象的原始 PDF 源码
print(doc.xref_object(xref))
