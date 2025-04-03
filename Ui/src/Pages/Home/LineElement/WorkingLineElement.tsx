// import material-ui компоненты
import { Tooltip } from '@mui/material';
// import react-router-dom
import { NavLink } from 'react-router-dom';

// import css стилей
import './WorkingLineElement.css'

// Интерфейс для входящих данных в лице пропсов
interface Props {
    titleNameElemet: string,
    idElement: string,
    linkElement: string,
    nameElement: string,
    valueElement?: number | undefined,
    size: string
}

export default function WorkingLineElement(props: Props) {
  const getStatusClass = (value?: number) => {
      if (value && value > 1500) return "WorkingLine__Element_bad";
      else if (value && value > 1000) return "WorkingLine__Element_normal";
      else return "WorkingLine__Element_good";
  };

  return (
      <Tooltip title={`${props.titleNameElemet} id: ${props.idElement}`}>
          <NavLink 
              to={`${props.linkElement}/${props.idElement}`}
              className={`WorkingLine__Element ${props.size} ${getStatusClass(props.valueElement)}`}
          >
              <div>{props.nameElement}</div>
          </NavLink>
      </Tooltip>
  );
}