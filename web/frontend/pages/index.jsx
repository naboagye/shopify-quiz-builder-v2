import {
  Card,
  Layout,
  TextContainer,
  Button,
  Spinner,
  Heading,
  Stack,
  Tag,
  Icon,
} from "@shopify/polaris";
import { HashtagMinor } from "@shopify/polaris-icons";
import { useNavigate } from "@shopify/app-bridge-react";
import { useFindMany, useAction } from "@gadgetinc/react";
import { api } from "../api";
import { useCallback } from "react";
import { useState } from "react";
import { PageTemplate } from "../components";

export default function HomePage() {
  const navigate = useNavigate();

  const [quizResponse] = useFindMany(api.quiz, {
    select: {
      __typename: true,
      id: true,
      title: true,
      body: true,
    },
  });

  const [markedForDelete, setMarkedForDelete] = useState(null);
  const [deleteQuizResponse, deleteQuiz] = useAction(api.quiz.delete);
  const deleteExistingQuiz = useCallback(async (quizId) => {
    setMarkedForDelete(quizId);
    await deleteQuiz({ id: quizId });
  });

  const onCreateNewQuiz = () => {
    navigate("/create-new-quiz");
  };

  const onEditQuiz = (id) => {
    navigate(`/quiz-editor/${id}`);
  };

  const IDTag = (props) => {
    return (
      <Tag
        onClick={() => {
          onEditQuiz(props.num);
        }}
      >
        <Stack spacing="extraTight">
          <Icon source={HashtagMinor} />
          <span>ID: {props.num}</span>
        </Stack>
      </Tag>
    );
  };

  if (quizResponse.fetching) {
    return (
      <PageTemplate>
        <Stack sectioned alignment="center">
          <Spinner /> <span>Loading...</span>
        </Stack>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <Layout>
        <Layout.Section>
          <Card sectioned title="Quiz admin">
            <Card.Section>
              <Stack sectioned alignment="center" distribution="equalSpacing">
                <TextContainer spacing="loose">
                  <p>Create a new quiz, or edit an existing quiz.</p>
                </TextContainer>
                <Button primary fullWidth onClick={() => onCreateNewQuiz()}>
                  Create new quiz
                </Button>
              </Stack>
            </Card.Section>
            <Card.Section>
              {quizResponse.data.length > 0 ? (
                quizResponse.data.map((quiz, i) => {
                  const isDeleting = markedForDelete === quiz.id;
                  return (
                    <Card key={i} sectioned subdued>
                      <Stack sectioned distribution="equalSpacing">
                        <TextContainer>
                          <IDTag num={quiz.id} />
                          <Heading>{quiz.title}</Heading>
                          <p>{quiz.body}</p>
                        </TextContainer>
                        {isDeleting && (
                          <Stack alignment="center">
                            <Spinner /> <span>Deleting...</span>
                          </Stack>
                        )}
                        <Stack sectioned>
                          <Button
                            disabled={isDeleting}
                            onClick={() => {
                              onEditQuiz(quiz.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            destructive
                            disabled={isDeleting}
                            onClick={() => {
                              deleteExistingQuiz(quiz.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })
              ) : (
                <Card subdued sectioned>
                  <Stack distribution="center">
                    <p>No quizzes created</p>
                  </Stack>
                </Card>
              )}
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </PageTemplate>
  );
}
