import React from 'react';
import {
  Segment,
  Header,
  Dropdown,
  Form, Grid, Checkbox,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import InternshipsFilters from './InternshipFilters';
import { recommendation, dropdownCareerInterest, isRemoteFunc } from './RecommendationScript';

function MockProfile({ onChildClick, skillsVal, careerVal, passedData, locationVal, isRemote }) {
  const internships = new InternshipsFilters();
  const data = internships.mergeData();
  let skillChange = skillsVal;
  let careerChange = careerVal;
  let recommendedData = [];
  let locationChange = locationVal;
  let remoteCheck = isRemote;
  const setFilters = () => {
    const newData = isRemoteFunc(recommendedData, remoteCheck);
    onChildClick(newData, skillChange, careerChange, locationChange, remoteCheck);
    window.scrollTo({
      top: 70,
      left: 100,
      behavior: 'smooth',
    });
  };
  const handleSubmit = () => {
    setFilters();
  };
  const getRemote = () => {
    remoteCheck = !remoteCheck;
    recommendedData = recommendation(skillChange, careerChange, data, locationChange);
    setFilters();
  };
  const getLocation = (event, { value }) => {
    locationChange = value;
    recommendedData = recommendation(skillChange, careerChange, data, locationChange);
    setFilters();
  };
  const getSkills = (event, { value }) => {
    skillChange = value;
    recommendedData = recommendation(skillChange, careerChange, data, locationChange);
    setFilters();
  };
  const getCareerInterest = (event, { value }) => {
    careerChange = value;
    recommendedData = recommendation(skillChange, careerChange, data, locationChange);
    setFilters();
  };
  return (
      <Segment style={{ width: '100%', borderRadius: '10px', marginTop: '3rem' }}>
        <Grid columns={'equal'}>
          <Grid.Row>
            <Grid.Column>
              <Form>
                <Form.Field
                    required
                    fluid multiple selection clearable
                    control={Dropdown}
                    options={internships.dropdownSkills(data)}
                    label={{ children: 'Skills' }}
                    placeholder='Skills'
                    search
                    onChange={getSkills}
                />
              </Form>
            </Grid.Column>
            <Grid.Column>
              <Form onSubmit={handleSubmit}>
                <Form.Field
                    required
                    fluid multiple selection clearable
                    control={Dropdown}
                    options={dropdownCareerInterest()}
                    label={{ children: 'Career Interest' }}
                    placeholder='Career Interest'
                    search
                    onChange={getCareerInterest}
                />
              </Form>
            </Grid.Column>
            <Grid.Column>
              <Form>
                <Form.Field
                    fluid selection multiple clearable
                    control={Dropdown}
                    options={internships.dropdownLocation(data)}
                    label={{ children: 'Location' }}
                    placeholder='Location'
                    search
                    onChange={getLocation}
                />
              </Form>
              <Checkbox style={{ paddingTop: '1rem' }} label='Remote'
                        onClick={getRemote}/>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header style={{ paddingBottom: '0', marginTop: '0rem' }}>
                Total results found: {internships.total(passedData)}
              </Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
  );
}

MockProfile.propTypes = {
  onChildClick: PropTypes.func.isRequired,
  passedData: PropTypes.array.isRequired,
  skillsVal: PropTypes.array.isRequired,
  careerVal: PropTypes.array.isRequired,
  locationVal: PropTypes.string.isRequired,
  isRemote: PropTypes.bool.isRequired,
};

export default MockProfile;
