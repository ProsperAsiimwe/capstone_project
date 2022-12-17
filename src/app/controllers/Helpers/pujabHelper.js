// sponsorAnnualReport
const { groupBy, map } = require('lodash');
const { pujabApplicationService } = require('@services/index');

const pujabProgrammeChoiceHelper = async (applicantAdmissionId) => {
  const programmeChoices = await pujabApplicationService.findAllProgrammeChoice(
    {
      where: {
        pujab_application_id: applicantAdmissionId,
      },
      order: [['choice_number', 'asc']],
      include: [
        {
          association: 'admissionProgramme',
          attributes: ['id', 'institution_programme_id'],
          include: [
            {
              association: 'institutionProgramme',
              include: [
                {
                  association: 'durationMeasure',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'award',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'studyLevel',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'institution',
                  attributes: ['id', 'name', 'code'],
                },
              ],
            },
            {
              association: 'pujabSection',
              attributes: ['id', 'metadata_value'],
            },
          ],
        },
      ],
    }
  );

  const groupedChoices = groupBy(
    map(programmeChoices, (programmeChoice) => ({
      id: programmeChoice.pujab_admission_institution_programme_id,
      choice_number: programmeChoice.choice_number,
      choice_number_name: programmeChoice.choice_number_name,
      pujab_section_id: programmeChoice.admissionProgramme.pujabSection.id,
      pujab_section:
        programmeChoice.admissionProgramme.pujabSection.metadata_value,
      programme_code:
        programmeChoice.admissionProgramme.institutionProgramme.programme_code,
      programme_title:
        programmeChoice.admissionProgramme.institutionProgramme.programme_title,
      award:
        programmeChoice.admissionProgramme.institutionProgramme.award
          .metadata_value,
      study_level:
        programmeChoice.admissionProgramme.institutionProgramme.studyLevel
          .metadata_value,
      institution_name:
        programmeChoice.admissionProgramme.institutionProgramme.institution
          .name,
    })),
    'pujab_section'
  );

  return groupedChoices;
};

module.exports = {
  pujabProgrammeChoiceHelper,
};
