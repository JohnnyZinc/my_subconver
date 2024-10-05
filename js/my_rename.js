function rename(nodes) {
    const regionMap = {
        "HK": "香港",
        "Hong Kong": "香港",
        "香港": "香港",
        "Hongkong": "香港",
        "Japan": "日本",
        "US": "美国",
        "USA": "美国",
        "Taiwan": "台湾",
        // 可以添加更多的地区映射
    };

    const lineTypeKeywords = ["IPLC", "IEPL", "专线", "优化", "IPv6", "V6"];
    const rateRegex = /(?:倍率:|[\d.]+x)/i;

    const regionCounters = {};

    function parseNodeName(nodeName) {
        let region = null; // 初始为空
        let lineType = "普通"; // 默认线路类型
        let rate = "1.0"; // 默认倍率

        // 1. 解析地区
        for (const [key, value] of Object.entries(regionMap)) {
            if (nodeName.includes(key)) {
                region = value;
                break; // 找到地区后退出循环
            }
        }

        // 2. 解析线路类型
        for (const keyword of lineTypeKeywords) {
            if (nodeName.includes(keyword)) {
                lineType = keyword;
                break;
            }
        }

        // 替换 V6 为 IPv6
        if (lineType === "V6") {
            lineType = "IPv6";
        }

        // 3. 解析倍率
        const rateMatch = nodeName.match(rateRegex);
        if (rateMatch) {
            rate = rateMatch[0].replace(/[^0-9.]/g, '');
        }

        // 4. 确定节点编号（按处理顺序生成）
        if (region) {
            if (!regionCounters[region]) {
                regionCounters[region] = 1; // 如果该地区是第一次出现，编号从1开始
            } else {
                regionCounters[region] += 1; // 该地区已经有节点，编号递增
            }
        }

        return {
            region,
            number: region ? regionCounters[region] : null, // 仅在地区不为空时赋值
            lineType,
            rate
        };
    }

    // 处理每个节点
    const parsedNodes = nodes.map(node => {
        const parsed = parseNodeName(node);
        const newName = parsed.region 
            ? `${parsed.region}${String(parsed.number).padStart(2, '0')}-${parsed.lineType}-倍率${parsed.rate}`
            : node; // 如果没有地区，则保持原名

        return {
            originalName: node,
            newName,
            ...parsed
        };
    });

    // 按照生成顺序返回重命名后的节点列表
    return parsedNodes.map(node => node.newName);
}

// 示例节点列表
const nodes = [
    "香港01-IPLC",
    "US-02",
    "Hong Kong01-IEPL-0.5x",
    "HK",
    "香港Hong Kong",
    "台湾02-流量倍率:0.1",
    "HK-IEPL",
    "US-IPLC",
    "HK-流量倍率:2.0",
    "香港-V6",
    "香港V6"
];

const renamedNodes = rename(nodes);
console.log(renamedNodes);
