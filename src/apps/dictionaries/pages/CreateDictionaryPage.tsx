import React, { useEffect }  from "react";
import { DictionaryForm } from "../components";
import { Grid, Paper } from "@material-ui/core";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  createDictionaryLoadingSelector,
  createDictionaryProgressSelector,
  createSourceAndDictionaryErrorsSelector,
  resetCreateDictionaryAction
} from "../redux";
import { APIDictionary, Dictionary } from "../types";
import {
  orgsSelector,
  profileSelector
} from "../../authentication/redux/reducer";
import { APIOrg, APIProfile } from "../../authentication";
import { usePrevious, CONTEXT } from "../../../utils";
import { createSourceAndDictionaryAction } from "../redux/actions";

interface Props {
  errors?: {};
  profile?: APIProfile;
  usersOrgs?: APIOrg[];
  createSourceAndDictionary: (
    ...args: Parameters<typeof createSourceAndDictionaryAction>
  ) => void;
  loading: boolean;
  newDictionary?: APIDictionary;
  resetCreateDictionary: () => void;
}

const CreateDictionaryPage: React.FC<Props> = ({
  profile,
  usersOrgs,
  errors,
  createSourceAndDictionary,
  loading,
  resetCreateDictionary,
  newDictionary
}: Props) => {
  const previouslyLoading = usePrevious(loading);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => resetCreateDictionary, []);

  if (!loading && previouslyLoading && newDictionary) {
    return <Redirect to={newDictionary.url} />;
  }

  return (
    <Grid id="create-dictionary-page" item xs={6} component="div">
      <Paper>
        <DictionaryForm
          context={CONTEXT.create}
          errors={errors}
          profile={profile}
          usersOrgs={usersOrgs ? usersOrgs : []}
          loading={loading}
          onSubmit={(values: Dictionary) => createSourceAndDictionary(values)}
        />
      </Paper>
    </Grid>
  );
};

const mapStateToProps = (state: any) => ({
  profile: profileSelector(state),
  usersOrgs: orgsSelector(state),
  loading: createDictionaryLoadingSelector(state),
  progress: createDictionaryProgressSelector(state),
  newDictionary: state.dictionaries.newDictionary,
  errors: createSourceAndDictionaryErrorsSelector(state)
});
const mapActionsToProps = {
  createSourceAndDictionary: createSourceAndDictionaryAction,
  resetCreateDictionary: resetCreateDictionaryAction
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(CreateDictionaryPage);
