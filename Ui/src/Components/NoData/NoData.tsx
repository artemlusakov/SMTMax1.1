import React from 'react';
import {
  Box,
  Typography,
  Fade,
  SvgIcon,
  styled
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

type IconVariant = 'database' | 'warning' | 'info' | 'inbox';

const iconVariants: Record<IconVariant, React.ComponentType> = {
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
  const getIconComponent = (): React.ComponentType | React.ReactNode => {
    if (typeof icon !== 'string') return icon;
    return iconVariants[icon as IconVariant];
  };

  const IconComponent = getIconComponent();

  const renderIcon = () => {
    if (!IconComponent) return null;
    
    if (React.isValidElement(IconComponent)) {
      return React.cloneElement(IconComponent, {
 
      });
    }

    const Icon = IconComponent as React.ComponentType;
    return (
      <SvgIcon
        component={Icon}
        fontSize="large"
        color={variant === 'warning' ? 'warning' : variant === 'info' ? 'info' : 'inherit'}
        sx={{
          fontSize: 64,
          opacity: 0.8,
          mb: 2
        }}
      />
    );
  };

  const content = (
    <StyledContainer>
      {renderIcon()}
      
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
      
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </StyledContainer>
  );

  return animate ? <Fade in timeout={500}>{content}</Fade> : content;
}