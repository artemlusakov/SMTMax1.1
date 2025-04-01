import React from 'react';
import {
  Box,
  Typography,
  Fade,
  SvgIcon,
  styled,
  useTheme
} from '@mui/material';
import {
  Dataset as DatabaseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Inbox as InboxIcon
} from '@mui/icons-material';

interface NoDataProps {
  message?: string;
  icon?: 'database' | 'warning' | 'info' | 'inbox' | React.ReactNode;
  variant?: 'default' | 'warning' | 'info';
  animate?: boolean;
  action?: React.ReactNode;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  maxWidth: "100%",
  height: "100%",
  margin: '0 auto'
}));

// Тип для вариантов иконок
type IconVariant = 'database' | 'warning' | 'info' | 'inbox';

// Объект с иконками с явной типизацией
const iconVariants: Record<IconVariant, typeof DatabaseIcon> = {
  database: DatabaseIcon,
  warning: WarningIcon,
  info: InfoIcon,
  inbox: InboxIcon
};

export default function NoData({
  message = 'Данные отсутствуют',
  icon = 'database',
  variant = 'default',
  animate = true,
  action
}: NoDataProps) {
  const theme = useTheme();
  const iconColor = variant === 'warning' 
    ? theme.palette.warning.main 
    : variant === 'info' 
      ? theme.palette.info.main 
      : theme.palette.text.secondary;

  // Типизированное получение иконки
  const getIconComponent = () => {
    if (typeof icon !== 'string') return icon;
    return iconVariants[icon as IconVariant];
  };

  const IconComponent = getIconComponent();

  const content = (
    <StyledContainer>
      {IconComponent && (
        <SvgIcon
          component={IconComponent}
          fontSize="large"
          color={variant === 'warning' ? 'warning' : variant === 'info' ? 'info' : 'inherit'}
          sx={{
            fontSize: 64,
            opacity: 0.8,
            mb: 2
          }}
        />
      )}
      
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {message}
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {variant === 'warning' 
          ? 'Проверьте подключение или повторите попытку позже'
          : variant === 'info'
            ? 'Создайте новые элементы для начала работы'
            : 'Записи в базе данных не найдены'}
      </Typography>
      
      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </StyledContainer>
  );

  return animate ? (
    <Fade in timeout={500}>
      {content}
    </Fade>
  ) : content;
}