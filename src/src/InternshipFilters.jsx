import _ from 'lodash';
import linkedinData from './data/linkedin.parsed.data';
import simplyData from './data/simplyhired.parsed.data';
import zipData from './data/ziprecruiter.parsed.data';
import cheggData from './data/internships.parsed.data';
import monsterData from './data/monster.parsed.data';
import youternData from './data/youtern.parsed.data';
import nsfData from './data/nsf-reu.parsed.data';
import iHire from './data/iHireTech.parsed.data';
import glassData from './data/glassdoor.parsed.data';
import indeedData from './data/indeed.parsed.data';
import angelData from './data/angellist.parsed.data';
import manualData from './data/manualInput.parsed.data';
import apple from './data/apple.parsed.data';
import aexpress from './data/aexpress.parsed.data';
import ACM from './data/acm.parsed.data';
import stackoverflow from './data/stackoverflow.parsed.data';
import idealist from './data/idealist.parsed.data';
import coolworks from './data/coolworks.parsed.data';

class InternshipsFilters {

  /* Returns total number of internship listing */
  total = (data) => data.length;

  mergeData() {
    let data = [];
    data = _.concat(zipData, simplyData);
    // data = _.concat(data, cheggData);
    data = _.concat(data, monsterData);
    data = _.concat(data, linkedinData);
    data = _.concat(data, youternData);
    // data = _.concat(data, nsfData);
    data = _.concat(data, iHire);
    data = _.concat(data, glassData);
    data = _.concat(data, indeedData);
    data = _.concat(data, angelData);
    data = _.concat(data, manualData);
    data = _.concat(data, stackoverflow);
    data = _.concat(data, idealist);
    data = _.concat(data, ACM);
    data = _.concat(data, coolworks);
    data = _.concat(data, aexpress);
    data = _.concat(data, apple);

    // console.log('zip:', zipData.length);
    // console.log('simply:', simplyData.length);
    // console.log('chegg:', cheggData.length);
    // console.log('monster:', monsterData.length);
    // console.log('linkedIn:', linkedinData.length);
    // console.log('total:', data.length);
    // let test = _.map(linkedinData, 'company');
    // console.log(test.sort());
    //
    // let test2 = _.map(angelData, 'location.state');
    //console.log(_.groupBy(test2));
    //console.log(_.filter(angelData, ['location.state', '']));
    return data;
  }

  /* Returns array of companies for us to be able to pass into semantic ui's dropdown. Format:
  * key: unique key of the company
  * text: Text that shows up in dropdown
  * value: value used to search
  * num: the number of internships with said company */
  dropdownCompany(data) {
    let companies = _.map(data, 'company');
    const categories = _.flattenDeep(companies);
    companies = _.uniq(categories).sort();

    const number = _.groupBy(data, 'company');
    const info = [];

    for (let i = 0; i < companies.length; i++) {

      info.push({
        key: companies[i],
        text: `${companies[i]} (${number[companies[i]].length})`,
        value: companies[i],
        num: number[companies[i]].length,
      });
    }

    // Adding any parameter to front of array
    info.unshift({
      key: 'any',
      text: 'Any',
      value: 'any',
    });

    return info;
  }

  /* Returns array of companies for us to be able to pass into semantic ui's dropdown. Format:
 * key: unique key of the company
 * text: Text that shows up in dropdown
 * value: value used to search
 * num: the number of internships with said company */
  dropdownLocation(data) {
    let location = _.map(data, 'location.state');
    // console.log(location);
    const categories = _.flattenDeep(location);
    location = _.uniq(categories).sort();
    // console.log(location);

    const number = _.groupBy(data, 'location.state');
    const info = [];

    for (let i = 0; i < location.length; i++) {

      let locationAmount = number[location[i]].length;
      // if (location[i] === 'Remote') {
      //   locationAmount = _.filter(data, ['remote', true]).length
      //       + number[location[i]].length;
      //
      // } else {
      //   locationAmount = number[location[i]].length;
      // }

      info.push({
        key: location[i],
        text: `${location[i]} (${locationAmount})`,
        value: location[i],
        num: number[location[i]].length,
      });
    }

    // Adding any parameter to front of array
    info.unshift({
      key: 'any',
      text: 'Any',
      value: 'any',
    });

    return info;
  }

  /* Returns array of skills for us to be able to pass into semantic ui's dropdown. Format:
* key: unique key of the skill
* text: Text that shows up in dropdown
* value: value used to search
* num: the number of internships with the associated skills */
  dropdownSkills() {
    const skills = _.map(this.mergeData(), 'skills');
    // console.log(skills);
    const flattenSkills = _.flattenDeep(skills);
    // console.log(flattenSkills);
    const uniqueSkills = _.uniq(flattenSkills).sort();
    // console.log(uniqueSkills);

    const number = _.groupBy(flattenSkills);
    // console.log(number);

    const info = [];

    for (let i = 0; i < uniqueSkills.length; i++) {
      info.push({
        key: uniqueSkills[i],
        text: `${uniqueSkills[i]} (${number[uniqueSkills[i]].length})`,
        value: uniqueSkills[i],
        num: number[uniqueSkills[i]].length,
      });
    }
    return info;
  }

  /* Sorts list by given parameters */
  sortedBy(data, value) {
    if (value === 'date') {
      return _.orderBy(data, ['posted'], ['desc']);
    }
    if (value === 'company') {
      return _.orderBy(data, ['company'], ['asc']);
    }
    return _.orderBy(data, ['position'], ['asc']);
  }

  /* Returns a list based on skill/tags inputs */
  filterBySkills(data, tags) {
    if (tags.length === 0) {
      return data;
    }

    const skills = [];
    let exists = false;
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
      // if any of the tags exist in data set, push it to skills and go to next
      while (counter < tags.length && exists === false) {
        if (data[i].skills.includes(tags[counter])) {
          skills.push(data[i]);
          exists = true;
        }
        counter++;
      }
      counter = 0;
      exists = false;
    }
    return skills;
  }

  /* Returns a sorted list by company name */
  filterByCompany(data, company) {
    if (company === 'any' || company.length === 0) {
      return data;
    }
    const list = [];
    for (let i = 0; i < data.length; i++) {
      const companies = data[i].company;
      const lowercase = companies.toString().toLowerCase();
      if (lowercase.includes(company.toString().toLowerCase())) {
        list.push(data[i]);
      }
    }
    return list;
  }

  /* Returns a list based on search query */
  filterBySearch(data, searchQuery) {
    // console.log(searchQuery);
    if (searchQuery.length === 0) {
      return data;
    }
    const list = [];
    for (let i = 0; i < data.length; i++) {
      const position = data[i].position;
      const lowercase = position.toString().toLowerCase();
      if (lowercase.includes(searchQuery.toString().toLowerCase())) {
        list.push(data[i]);
      }
    }
    return list;
  }

  /* Returns a sorted list by location */
  filterByLocation(data, input) {
    if (input === 'any') {
      return data;
    }

    // // Add all the internships where remote == true and those who have remote in state
    // if (input === 'Remote') {
    //   const byState = _.filter(data, ['location.state', input]);
    //   const remote = _.filter(data, ['remote', true]);
    //   return _.concat(byState, remote);
    // }
    return _.filter(data, ['location.state', input]);
  }

  isRemote(data, value) {
    if (value === false) {
      return data;
    }
     return _.filter(data, ['remote', true]);
  }
}

export default InternshipsFilters;
