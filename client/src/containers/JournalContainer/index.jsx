import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { initialize } from 'redux-form';

import JournalWrapper from './styled';
import changeActiveTab from '../App/Redux/appActions';
import Tab from '../../shared/types/Tab';
import { PlusThickIcon } from '../../shared/styled/icons';
import { showModal, hideModal } from '../../shared/modal/redux/actions';
import { fetchTrainings, addTraining } from './redux/actions';
import { User, Training } from '../../shared/prop-types';
import TrainingTable from './components/TrainingTable';

const JournalContainer = (props) => {
  // set active tab
  useEffect(
    () => {
      props.changeActiveTab(Tab.JOURNAL);
    },
    [props.user],
  );
  // fetch trainings
  useEffect(
    () => {
      props.fetchTrainings();
    },
    [],
  );

  const handleTrainingSubmit = (training) => {
    props.addTraining(training);
    props.hideModal();
  };

  const showTrainingModal = (initData = { activity: 'RUNNING', distance: 10 }) => {
    const { user: { signUpDate } } = props;
    const modalProps = {
      handleCancel: props.hideModal,
      minDate: signUpDate,
      onSubmit: handleTrainingSubmit,
    };
    props.showModal('TrainingModal', modalProps);
    props.reduxFormInitialize('TrainingForm', initData);
  };

  return (
    <JournalWrapper>
      <Button color="primary" size="lg" onClick={() => showTrainingModal()}><PlusThickIcon /> Add training</Button>
      <TrainingTable trainings={props.trainings} />
    </JournalWrapper>
  );
};

JournalContainer.propTypes = {
  changeActiveTab: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  fetchTrainings: PropTypes.func.isRequired,
  reduxFormInitialize: PropTypes.func.isRequired,
  user: User,
  trainings: PropTypes.arrayOf(Training),
  addTraining: PropTypes.func.isRequired,
};

JournalContainer.defaultProps = {
  user: {},
  trainings: [],
};

const mapStateToProps = ({ currentUser, journal }) => {
  const { user } = currentUser;
  const { trainings } = journal;
  return {
    user,
    trainings,
  };
};

const mapDispatchToProps = {
  changeActiveTab,
  showModal,
  hideModal,
  fetchTrainings,
  addTraining,
  reduxFormInitialize: initialize,
};

export default connect(mapStateToProps, mapDispatchToProps)(JournalContainer);
