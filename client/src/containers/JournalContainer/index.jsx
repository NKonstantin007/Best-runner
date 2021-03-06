import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { initialize } from 'redux-form';
import moment from 'moment';
import { compose } from 'redux';

import JournalWrapper from './styled';
import changeActiveTab from '../App/Redux/appActions';
import Tab from '../../shared/types/Tab';
import { PlusThickIcon } from '../../shared/styled/icons';
import { showModal, hideModal } from '../../shared/modal/redux/actions';
import { fetchTrainings, addTraining, editTraining, deleteTraining } from './redux/actions';
import { User, Training } from '../../shared/prop-types';
import TrainingTable from './components/TrainingTable';
import withSpinner from '../../shared/hocs/withSpinner';
import FilterPanel from './components/FilterPanel';
import ActivityOptions from '../../shared/select-options/Activity';
import SortTrainingOptions from '../../shared/select-options/SortTraining';

const TrainingTableWithSpinner = withSpinner(TrainingTable);

const JournalContainer = (props) => {
  // set active tab
  useEffect(
    () => {
      props.changeActiveTab(Tab.JOURNAL);
    },
    [],
  );
  // fetch trainings
  useEffect(
    () => {
      props.fetchTrainings();
    },
    [],
  );

  const { user, isFetching } = props;
  const signUpDate = user ? moment(user.signUpDate) : moment();

  const [filteredActivities, setFilteredActivities] = useState(ActivityOptions.map(op => op.value));
  const [dateRange, setDateRange] = useState({ startDate: signUpDate, endDate: moment() });
  const [sortBy, setSortBy] = useState(SortTrainingOptions[0].value);

  const createTrainingSubmitHandler = isEdit => (training) => {
    const newTraining = {
      ...training,
      date: training.date.toDate(),
    };
    if (isEdit) {
      props.editTraining(newTraining);
    } else {
      props.addTraining(newTraining);
    }
    props.hideModal();
  };

  const showTrainingModal = (isEdit, initData = { activity: 'Running', distance: 10 }) => {
    const modalProps = {
      handleCancel: props.hideModal,
      minDate: signUpDate,
      isEdit,
      onSubmit: createTrainingSubmitHandler(isEdit),
    };
    props.showModal('TrainingModal', modalProps);
    props.reduxFormInitialize('TrainingForm', !isEdit ? initData : { ...initData, date: moment(initData.date) });
  };

  const handleActivitiesSelect = selectedOptions => setFilteredActivities(selectedOptions);

  const handleDateRangeApply = datePicker => setDateRange(datePicker);

  const handleSortBySelect = selectedOption => setSortBy(selectedOption);

  const filterByActivities = trainings => trainings.filter(t => filteredActivities.includes(t.activity));

  const filterByDateRange = (trainings) => {
    const startMoment = dateRange.startDate.startOf('day');
    const endMoment = dateRange.endDate.startOf('day');
    return trainings.filter((t) => {
      const tMoment = moment(t.date).startOf('day');
      return (startMoment.diff(tMoment, 'days') <= 0 && endMoment.diff(tMoment, 'days') >= 0);
    });
  };

  const sortTrainings = (trainings) => {
    let compareFunc;
    switch (sortBy) {
      case 'DateUp': {
        compareFunc = (t1, t2) => {
          const t1m = moment(t1.date);
          const t2m = moment(t2.date);
          if (t1m.diff(t2m, 'seconds') < 0) return -1;
          else if (t1m.diff(t2m, 'seconds') > 0) return 1;
          return 0;
        };
        break;
      }
      case 'DateDown': {
        compareFunc = (t1, t2) => {
          const t1m = moment(t1.date);
          const t2m = moment(t2.date);
          if (t1m.diff(t2m, 'seconds') < 0) return 1;
          else if (t1m.diff(t2m, 'seconds') > 0) return -1;
          return 0;
        };
        break;
      }
      case 'DistanceUp': {
        compareFunc = (t1, t2) => {
          if (t1.distance < t2.distance) return -1;
          else if (t1.distance > t2.distance) return 1;
          return 0;
        };
        break;
      }
      case 'DistanceDown': {
        compareFunc = (t1, t2) => {
          if (t1.distance < t2.distance) return 1;
          else if (t1.distance > t2.distance) return -1;
          return 0;
        };
        break;
      }
      default:
        compareFunc = () => 0;
    }
    return trainings.sort(compareFunc);
  };

  const filteredTrainings = compose(sortTrainings, filterByDateRange, filterByActivities)(props.trainings);

  return (
    <JournalWrapper>
      <Button color="primary" size="lg" onClick={() => showTrainingModal(false)}><PlusThickIcon /> Add training</Button>
      <FilterPanel
        minDate={signUpDate}
        dateRange={dateRange}
        sortBy={sortBy}
        filteredActivities={filteredActivities}
        handleActivitiesSelect={handleActivitiesSelect}
        handleDateRangeApply={handleDateRangeApply}
        handleSortBySelect={handleSortBySelect}
      />
      <TrainingTableWithSpinner
        trainings={filteredTrainings}
        handleEdit={training => showTrainingModal(true, training)}
        handleDelete={id => props.deleteTraining(id)}
        isFetching={isFetching}
      />
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
  trainings: PropTypes.arrayOf(Training).isRequired,
  addTraining: PropTypes.func.isRequired,
  deleteTraining: PropTypes.func.isRequired,
  editTraining: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

JournalContainer.defaultProps = {
  user: {},
};

const mapStateToProps = ({ currentUser, journal }) => {
  const { user } = currentUser;
  const { trainings, isFetching } = journal;
  return {
    user,
    trainings,
    isFetching,
  };
};

const mapDispatchToProps = {
  changeActiveTab,
  showModal,
  hideModal,
  fetchTrainings,
  addTraining,
  deleteTraining,
  editTraining,
  reduxFormInitialize: initialize,
};

export default connect(mapStateToProps, mapDispatchToProps)(JournalContainer);
