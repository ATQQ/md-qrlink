import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// 原始解析函数
export const parseMarkdown = (content) => {
  return md.render(content);
};

// 将图片转换为base64
const convertImageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return url; // 如果转换失败，返回原始URL
  }
};

// 提取带超链接的标题并转换
export const transformMarkdown = (content) => {
  // 分割内容为行
  const lines = content.split('\n');
  const transformedLines = [];
  
  // 正则表达式匹配带超链接的标题
  // 例如：# [标题文本](链接)
  const linkHeaderRegex = /^(#{1,6})\s*\[(.+?)\]\((.+?)\)(.*)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(linkHeaderRegex);
    
    if (match) {
      // 提取匹配组
      const [, headerMarks, title, url, restOfLine] = match;
      
      // 保留原始标题行
      transformedLines.push(line);
      
      // 添加链接到标题下方，将QR码和链接放在同一行
      transformedLines.push(`<div class="link-container">
        <div class="qrcode-placeholder" data-url="${url}"></div>
        <a href="${url}" target="_blank">${url}</a>
      </div>`);
    } else {
      // 保留原始行，不做处理
      transformedLines.push(line);
    }
  }
  
  return transformedLines.join('\n');
};

// 将转换后的Markdown渲染为HTML
export const renderTransformedMarkdown = async (content) => {
  // 先转换Markdown为带有二维码占位符的格式
  const transformed = transformMarkdown(content);
  
  // 直接渲染转换后的内容，不处理图片
  // 图片将保持原始Markdown格式，由markdown-it渲染
  return md.render(transformed);
}


// 生成二维码的base64图片
const generateQRCodeBase64 = async (url) => {
  try {
    // 使用第三方库生成二维码
    // 这里使用动态导入，避免在服务端渲染时出错
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 100,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// 获取转换后的HTML，但保留原始Markdown中的图片和链接
export const getTransformedContentForCopy = async (content) => {
  // 分割内容为行
  const lines = content.split('\n');
  const transformedLines = [];
  
  // 正则表达式匹配带超链接的标题
  const linkHeaderRegex = /^(#{1,6})\s*\[(.+?)\]\((.+?)\)(.*)$/;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const headerMatch = line.match(linkHeaderRegex);
    
    if (headerMatch) {
      // 提取匹配组
      const [, headerMarks, title, url, restOfLine] = headerMatch;
      
      // 保留原始标题行
      transformedLines.push(line);
      
      try {
        // 生成二维码的base64图片
        const qrCodeBase64 = await generateQRCodeBase64(url);
        
        // 添加二维码图片和链接
        if (qrCodeBase64) {
          transformedLines.push(`<div style="display:flex;align-items:flex-start;margin:10px 0;padding:10px;background-color:#f9f9f9;border-radius:4px;text-align:left;flex-wrap:nowrap;overflow:hidden;">
            <img src="${qrCodeBase64}" alt="QR Code" style="display:inline-block;margin-right:15px;vertical-align:top;width:100px;height:100px;flex-shrink:0;">
            <a href="${url}" target="_blank" style="display:inline-block;vertical-align:middle;word-break:break-all;word-wrap:break-word;overflow-wrap:break-word;flex:1;min-width:0;padding:5px 0;">${url}</a>
          </div>`);
        } else {
          // 如果二维码生成失败，只添加链接
          transformedLines.push(`<a href="${url}" target="_blank">${url}</a>`);
        }
      } catch (error) {
        console.error('Error in QR code generation:', error);
        // 如果出错，只添加链接
        transformedLines.push(`<a href="${url}" target="_blank">${url}</a>`);
      }
    } else {
      // 保留原始行，不处理图片
      transformedLines.push(line);
    }
  }
  
  return transformedLines.join('\n');
};