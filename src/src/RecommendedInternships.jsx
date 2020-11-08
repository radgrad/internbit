import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Container, Header, Icon, Grid, Item } from 'semantic-ui-react';
import InternshipListingCard2 from './InternshipListingCard2';
import MockProfile from './MockProfile';
import InternshipsFilters from './InternshipFilters';

function RecommendedInternships() {

  const internships = new InternshipsFilters();
  const getInternshipData = internships.mergeData();

  const [data, setData] = useState(getInternshipData);
  const [paginatedData, setPaginatedData] = useState(getInternshipData.slice(0, 40));

  const [skills, setSkills] = useState([]);
  const [career, setCareer] = useState([]);
  const [page, setPage] = useState(1);
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  /* Passes data up from MockProfile. SetPaginatedData allows data to be rendered
  * for infinite scroll. */
  function handleChildClick(passedData, skillsVal, careerVal) {
    // console.log(passedData);
    setData(passedData);
    setSkills(skillsVal);
    setCareer(careerVal);
    setPage(1);
    setPaginatedData(passedData.slice(0, 40));
  }

  /* Grabs the height */
  useEffect(() => {
    setHeight(ref.current.clientHeight);
  });

  /* Infinite scrolling */
  function handleScroll() {
    window.onscroll = function () {
      const scroll = window.innerHeight + window.pageYOffset;
      // if we hit the bottom
      if (scroll >= height - 500) {
        // if there are still more items to be loaded
        if (page <= Math.ceil(data.length / 40)) {
          const newPage = page + 1;
          setPage(newPage);
          setPaginatedData(data.slice(0, newPage * 40));
        }
      }
    };
  }

  return (
      <Container style={{ paddingTop: '5rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
        <Header as='h2' textAlign={'center'}
                style={{ paddingBottom: '1rem', paddingTop: '3rem' }}>
          <Header.Content>
            <Icon name='graduation cap'/>
            Recommended Internships
          </Header.Content>
        </Header>
        <Grid columns={'equal'} doubling stackable>
          <Grid.Column width={4}>
            <MockProfile onChildClick={handleChildClick} passedData={data}
                        skillsVal={skills} careerVal={career}/>
          </Grid.Column>

          <Grid.Column>
            {/*<Card.Group itemsPerRow={3} doubling stackable>*/}
            {/*  {_.map(paginatedData, (internship, index) => <InternshipListingCard*/}
            {/*      internship={internship} key={index}/>)}*/}
            {/*</Card.Group>*/}

            <div onScroll={handleScroll()} ref={ref}>
              <Item.Group divided relaxed style={{ backgroundColor: 'white' }}>
                {_.map(paginatedData, (internship, index) => <InternshipListingCard2
                    internship={internship} key={index} hasSkills={skills}/>)}
              </Item.Group>
            </div>

          </Grid.Column>
        </Grid>
        <div align={'center'} style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        </div>
      </Container>
  );
}

export default RecommendedInternships;
