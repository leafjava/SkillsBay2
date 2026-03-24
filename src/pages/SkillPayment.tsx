import { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Button, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { toNano } from "ton";
import useNotification from "hooks/useNotification";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: "0 auto",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
}));

const PAYMENT_CONTRACT =
  process.env.REACT_APP_PAYMENT_CONTRACT || "EQAPgryAPFuCLXfblAa8hcLjIMeaRJS-B3bxtu5enj2my7he";
const PAYMENT_AMOUNT = "0.01";

interface SkillInfo {
  id: string;
  name: string;
  description: string;
}

const getSkillFromUrl = (): SkillInfo | null => {
  const params = new URLSearchParams(window.location.search);
  const startapp = params.get("startapp");

  if (!startapp) return null;

  const skills: Record<string, SkillInfo> = {
    "skill_news_001": {
      id: "skill_news_001",
      name: "全球每日新闻 Top 10",
      description:
        "每日抓取路透社、美联社等主流媒体的头条，利用 AI 进行去重、翻译并提炼核心摘要。强调信息降噪，用户不需要在几十个频道里刷消息，只需一键获得全球局势。",
    },
    "skill_weather_002": {
      id: "skill_weather_002",
      name: "智能天气管家",
      description:
        "接入高精度气象 API（如 OpenWeather），预测未来 15 天。AI 会自动判断降水概率，并给出具体的带伞建议。强调决策辅助，它不是冷冰冰的数据，而是人性化的生活助理。",
    },
    "skill_tech_003": {
      id: "skill_tech_003",
      name: "极客技术热点",
      description:
        "扫描 GitHub Trending、Hacker News 以及顶级科技大厂（如 OpenAI, Google）的博客，总结出当前最火的 10 个技术点。强调专业深度，面向开发者和极客，解决技术焦虑。",
    },
  };

  return skills[startapp] || null;
};

export const SkillPayment = () => {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const { showNotification } = useNotification();

  const [skill, setSkill] = useState<SkillInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const skillInfo = getSkillFromUrl();
    setSkill(skillInfo);

    if (!skillInfo) {
      showNotification("未找到技能信息", "error");
    }

    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.ready();
      (window as any).Telegram.WebApp.expand();
    }
  }, [showNotification]);

  const handlePayment = async () => {
    if (!userAddress) {
      showNotification("请先连接钱包", "warning");
      return;
    }

    if (!skill) {
      showNotification("技能信息错误", "error");
      return;
    }

    setLoading(true);

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: PAYMENT_CONTRACT,
            amount: toNano(PAYMENT_AMOUNT).toString(),
            payload: "",
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      setPaymentSuccess(true);
      showNotification(`支付成功！已解锁技能: ${skill.name}`, "success");

      if ((window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.sendData(
          JSON.stringify({
            action: "payment_success",
            skillId: skill.id,
            txHash: result.boc,
          }),
        );

        setTimeout(() => {
          (window as any).Telegram.WebApp.close();
        }, 3000);
      }
    } catch (error) {
      console.error("支付失败:", error);
      showNotification(`支付失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!skill) {
    return (
      <PageWrapper>
        <Typography variant="h5" gutterBottom>
          加载中...
        </Typography>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom align="center">
        技能支付
      </Typography>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {skill.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {skill.description}
          </Typography>
          <Typography variant="body1" color="primary">
            价格: {PAYMENT_AMOUNT} TON
          </Typography>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            支付信息
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            合约地址: {PAYMENT_CONTRACT.slice(0, 8)}...{PAYMENT_CONTRACT.slice(-6)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            网络: Testnet
          </Typography>
        </CardContent>
      </StyledCard>

      {!userAddress ? (
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            请先连接 TON 钱包
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => tonConnectUI.openModal()}>
            连接钱包
          </Button>
        </Box>
      ) : paymentSuccess ? (
        <Box textAlign="center" mt={3}>
          <Typography variant="h6" color="success.main" gutterBottom>
            ✅ 支付成功！
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            您已成功解锁技能: {skill.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            正在返回 Bot...
          </Typography>
        </Box>
      ) : (
        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handlePayment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}>
            {loading ? "支付中..." : `支付 ${PAYMENT_AMOUNT} TON`}
          </Button>

          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            钱包地址: {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
          </Typography>
        </Box>
      )}
    </PageWrapper>
  );
};
